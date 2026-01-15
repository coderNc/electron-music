import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { TrackMetadata, FolderInfo, Album, Artist, LibraryConfig } from '@shared/types'
import { ipcService } from '@renderer/services/ipc-service'

export interface LibraryState {
  // State
  folders: FolderInfo[]
  tracks: TrackMetadata[]
  isScanning: boolean
  scanProgress: { current: number; total: number; currentFile?: string }
  searchQuery: string
  lastScanTime: number
  error: string | null
}

export interface LibraryActions {
  // Folder management
  addFolder: () => Promise<void>
  removeFolder: (folderId: string) => Promise<void>
  refreshFolder: (folderId: string) => Promise<void>
  refreshAllFolders: () => Promise<void>

  // Search and filter
  setSearchQuery: (query: string) => void
  clearSearch: () => void

  // Library loading
  loadLibrary: () => Promise<void>
  saveLibrary: () => Promise<void>

  // Computed getters
  getFilteredTracks: () => TrackMetadata[]
  getTracksByFolder: (folderId: string) => TrackMetadata[]
  getTracksByAlbum: (album: string, artist?: string) => TrackMetadata[]
  getTracksByArtist: (artist: string) => TrackMetadata[]
  getAlbums: () => Album[]
  getArtists: () => Artist[]
  getTrackById: (id: string) => TrackMetadata | undefined

  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

export type LibraryStore = LibraryState & LibraryActions

const initialState: LibraryState = {
  folders: [],
  tracks: [],
  isScanning: false,
  scanProgress: { current: 0, total: 0 },
  searchQuery: '',
  lastScanTime: 0,
  error: null
}

/**
 * Generates a unique ID for a folder based on its path
 */
function generateFolderId(path: string): string {
  // Simple hash function for generating IDs
  let hash = 0
  for (let i = 0; i < path.length; i++) {
    const char = path.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `folder_${Math.abs(hash).toString(16)}`
}

/**
 * Gets the folder name from a path
 */
function getFolderName(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || path
}

/**
 * Checks if a track matches a search query
 */
function matchesSearch(track: TrackMetadata, query: string): boolean {
  const lowerQuery = query.toLowerCase()
  return (
    track.title.toLowerCase().includes(lowerQuery) ||
    track.artist.toLowerCase().includes(lowerQuery) ||
    track.album.toLowerCase().includes(lowerQuery) ||
    (track.genre?.toLowerCase().includes(lowerQuery) ?? false)
  )
}

export const useLibraryStore = create<LibraryStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    addFolder: async () => {
      try {
        // Open folder selection dialog
        const folderPath = await ipcService.selectFolder()
        if (!folderPath) return // User cancelled

        const state = get()

        // Check if folder already exists
        const existingFolder = state.folders.find((f) => f.path === folderPath)
        if (existingFolder) {
          set({ error: 'This folder is already in your library' })
          return
        }

        // Generate folder info
        const folderId = generateFolderId(folderPath)
        const folderInfo: FolderInfo = {
          id: folderId,
          path: folderPath,
          name: getFolderName(folderPath),
          addedAt: Date.now(),
          trackCount: 0,
          lastScanTime: 0
        }

        // Add folder to state
        set({
          folders: [...state.folders, folderInfo],
          isScanning: true,
          scanProgress: { current: 0, total: 0 },
          error: null
        })

        // Scan folder for audio files
        const filePaths = await ipcService.scanFolder(folderPath)

        set({ scanProgress: { current: 0, total: filePaths.length } })

        // Parse metadata for all files
        const newTracks = await ipcService.parseFiles(filePaths, folderId)

        // Update folder with track count
        const updatedFolder: FolderInfo = {
          ...folderInfo,
          trackCount: newTracks.length,
          lastScanTime: Date.now()
        }

        set((state) => ({
          folders: state.folders.map((f) => (f.id === folderId ? updatedFolder : f)),
          tracks: [...state.tracks, ...newTracks],
          isScanning: false,
          scanProgress: { current: filePaths.length, total: filePaths.length },
          lastScanTime: Date.now()
        }))

        // Save library
        await get().saveLibrary()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add folder'
        set({ isScanning: false, error: message })
      }
    },

    removeFolder: async (folderId: string) => {
      const state = get()
      const folder = state.folders.find((f) => f.id === folderId)
      if (!folder) return

      // Remove folder and its tracks
      set({
        folders: state.folders.filter((f) => f.id !== folderId),
        tracks: state.tracks.filter((t) => t.folderId !== folderId),
        error: null
      })

      // Save library
      await get().saveLibrary()
    },

    refreshFolder: async (folderId: string) => {
      const state = get()
      const folder = state.folders.find((f) => f.id === folderId)
      if (!folder) return

      try {
        // Check if folder still exists
        const exists = await ipcService.pathExists(folder.path)
        if (!exists) {
          set({ error: `Folder not found: ${folder.path}` })
          return
        }

        set({
          isScanning: true,
          scanProgress: { current: 0, total: 0 },
          error: null
        })

        // Remove old tracks from this folder
        const otherTracks = state.tracks.filter((t) => t.folderId !== folderId)

        // Scan folder for audio files
        const filePaths = await ipcService.scanFolder(folder.path)

        set({ scanProgress: { current: 0, total: filePaths.length } })

        // Parse metadata for all files
        const newTracks = await ipcService.parseFiles(filePaths, folderId)

        // Update folder with new track count
        const updatedFolder: FolderInfo = {
          ...folder,
          trackCount: newTracks.length,
          lastScanTime: Date.now()
        }

        set({
          folders: state.folders.map((f) => (f.id === folderId ? updatedFolder : f)),
          tracks: [...otherTracks, ...newTracks],
          isScanning: false,
          scanProgress: { current: filePaths.length, total: filePaths.length },
          lastScanTime: Date.now()
        })

        // Save library
        await get().saveLibrary()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to refresh folder'
        set({ isScanning: false, error: message })
      }
    },

    refreshAllFolders: async () => {
      const state = get()
      for (const folder of state.folders) {
        await get().refreshFolder(folder.id)
      }
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
    },

    clearSearch: () => {
      set({ searchQuery: '' })
    },

    loadLibrary: async () => {
      try {
        const config = await ipcService.loadLibraryConfig()
        set({
          folders: config.folders,
          tracks: config.tracks,
          lastScanTime: config.lastScanTime,
          error: null
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load library'
        set({ error: message })
      }
    },

    saveLibrary: async () => {
      const state = get()
      const config: LibraryConfig = {
        folders: state.folders,
        tracks: state.tracks,
        lastScanTime: state.lastScanTime
      }
      try {
        await ipcService.saveLibraryConfig(config)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save library'
        set({ error: message })
      }
    },

    getFilteredTracks: () => {
      const state = get()
      if (!state.searchQuery.trim()) {
        return state.tracks
      }
      return state.tracks.filter((track) => matchesSearch(track, state.searchQuery))
    },

    getTracksByFolder: (folderId: string) => {
      const state = get()
      return state.tracks.filter((t) => t.folderId === folderId)
    },

    getTracksByAlbum: (album: string, artist?: string) => {
      const state = get()
      return state.tracks.filter((t) => {
        const albumMatch = t.album.toLowerCase() === album.toLowerCase()
        if (!artist) return albumMatch
        return albumMatch && t.artist.toLowerCase() === artist.toLowerCase()
      })
    },

    getTracksByArtist: (artist: string) => {
      const state = get()
      return state.tracks.filter((t) => t.artist.toLowerCase() === artist.toLowerCase())
    },

    getAlbums: () => {
      const state = get()
      const albumMap = new Map<string, Album>()

      for (const track of state.tracks) {
        const key = `${track.album}|||${track.albumArtist || track.artist}`
        const existing = albumMap.get(key)

        if (existing) {
          existing.tracks.push(track)
          existing.trackCount++
          // Use the first track's cover if available
          if (!existing.coverData && track.coverUrl) {
            existing.coverData = track.coverUrl
          }
          // Use the earliest year
          if (track.year && (!existing.year || track.year < existing.year)) {
            existing.year = track.year
          }
        } else {
          albumMap.set(key, {
            name: track.album,
            artist: track.albumArtist || track.artist,
            year: track.year,
            trackCount: 1,
            tracks: [track],
            coverData: track.coverUrl
          })
        }
      }

      // Sort tracks within each album by track number
      for (const album of albumMap.values()) {
        album.tracks.sort((a, b) => {
          const diskA = a.diskNumber ?? 1
          const diskB = b.diskNumber ?? 1
          if (diskA !== diskB) return diskA - diskB
          const trackA = a.trackNumber ?? 0
          const trackB = b.trackNumber ?? 0
          return trackA - trackB
        })
      }

      return Array.from(albumMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    },

    getArtists: () => {
      const state = get()
      const artistMap = new Map<string, Artist>()

      // First, build album data
      const albums = get().getAlbums()

      for (const track of state.tracks) {
        const artistName = track.artist
        const existing = artistMap.get(artistName.toLowerCase())

        if (existing) {
          existing.trackCount++
        } else {
          // Find albums by this artist
          const artistAlbums = albums.filter(
            (a) => a.artist.toLowerCase() === artistName.toLowerCase()
          )

          artistMap.set(artistName.toLowerCase(), {
            name: artistName,
            albumCount: artistAlbums.length,
            trackCount: 1,
            albums: artistAlbums
          })
        }
      }

      // Update album counts
      for (const artist of artistMap.values()) {
        const artistAlbums = albums.filter(
          (a) => a.artist.toLowerCase() === artist.name.toLowerCase()
        )
        artist.albumCount = artistAlbums.length
        artist.albums = artistAlbums
      }

      return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    },

    getTrackById: (id: string) => {
      const state = get()
      return state.tracks.find((t) => t.id === id)
    },

    setError: (error: string | null) => {
      set({ error })
    },

    clearError: () => {
      set({ error: null })
    }
  }))
)

// Set up scan progress listener
ipcService.onScanProgress((progress) => {
  useLibraryStore.setState({
    scanProgress: {
      current: progress.current,
      total: progress.total,
      currentFile: progress.currentFile
    }
  })
})

// Export selectors for convenience
export const selectFolders = (state: LibraryStore): FolderInfo[] => state.folders
export const selectTracks = (state: LibraryStore): TrackMetadata[] => state.tracks
export const selectIsScanning = (state: LibraryStore): boolean => state.isScanning
export const selectScanProgress = (
  state: LibraryStore
): { current: number; total: number; currentFile?: string } => state.scanProgress
export const selectSearchQuery = (state: LibraryStore): string => state.searchQuery
export const selectError = (state: LibraryStore): string | null => state.error
