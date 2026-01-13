import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Playlist, TrackMetadata } from '../../../shared/types'
import { ipcService } from '../services/ipc-service'

export interface PlaylistState {
  // State
  playlists: Playlist[]
  currentPlaylistId: string | null
  isLoading: boolean
  error: string | null
}

export interface PlaylistActions {
  // Playlist management
  createPlaylist: (name: string) => Promise<void>
  deletePlaylist: (playlistId: string) => Promise<void>
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>

  // Track management
  addTrackToPlaylist: (playlistId: string, track: TrackMetadata) => Promise<void>
  addTracksToPlaylist: (playlistId: string, tracks: TrackMetadata[]) => Promise<void>
  removeTrackFromPlaylist: (playlistId: string, trackIndex: number) => Promise<void>
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>

  // Navigation
  setCurrentPlaylist: (playlistId: string | null) => void

  // Persistence
  loadPlaylists: () => Promise<void>
  savePlaylists: () => Promise<void>

  // Getters
  getPlaylistById: (playlistId: string) => Playlist | undefined
  getPlaylistTracks: (playlistId: string, allTracks: TrackMetadata[]) => TrackMetadata[]

  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

export type PlaylistStore = PlaylistState & PlaylistActions


const initialState: PlaylistState = {
  playlists: [],
  currentPlaylistId: null,
  isLoading: false,
  error: null
}

/**
 * Generates a unique ID for a playlist
 */
function generatePlaylistId(): string {
  return `playlist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const usePlaylistStore = create<PlaylistStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    createPlaylist: async (name: string) => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        set({ error: 'Playlist name cannot be empty' })
        return
      }

      const state = get()

      // Check for duplicate names
      const existingPlaylist = state.playlists.find(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (existingPlaylist) {
        set({ error: 'A playlist with this name already exists' })
        return
      }

      const newPlaylist: Playlist = {
        id: generatePlaylistId(),
        name: trimmedName,
        trackIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      set({
        playlists: [...state.playlists, newPlaylist],
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },

    deletePlaylist: async (playlistId: string) => {
      const state = get()
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return

      set({
        playlists: state.playlists.filter((p) => p.id !== playlistId),
        currentPlaylistId:
          state.currentPlaylistId === playlistId ? null : state.currentPlaylistId,
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },

    renamePlaylist: async (playlistId: string, newName: string) => {
      const trimmedName = newName.trim()
      if (!trimmedName) {
        set({ error: 'Playlist name cannot be empty' })
        return
      }

      const state = get()

      // Check for duplicate names (excluding current playlist)
      const existingPlaylist = state.playlists.find(
        (p) => p.id !== playlistId && p.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (existingPlaylist) {
        set({ error: 'A playlist with this name already exists' })
        return
      }

      set({
        playlists: state.playlists.map((p) =>
          p.id === playlistId ? { ...p, name: trimmedName, updatedAt: Date.now() } : p
        ),
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },


    addTrackToPlaylist: async (playlistId: string, track: TrackMetadata) => {
      const state = get()
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return

      // Check if track already exists in playlist
      if (playlist.trackIds.includes(track.id)) {
        return // Don't add duplicates
      }

      set({
        playlists: state.playlists.map((p) =>
          p.id === playlistId
            ? { ...p, trackIds: [...p.trackIds, track.id], updatedAt: Date.now() }
            : p
        ),
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },

    addTracksToPlaylist: async (playlistId: string, tracks: TrackMetadata[]) => {
      const state = get()
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return

      // Filter out tracks that already exist in playlist
      const newTrackIds = tracks
        .map((t) => t.id)
        .filter((id) => !playlist.trackIds.includes(id))

      if (newTrackIds.length === 0) return

      set({
        playlists: state.playlists.map((p) =>
          p.id === playlistId
            ? { ...p, trackIds: [...p.trackIds, ...newTrackIds], updatedAt: Date.now() }
            : p
        ),
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },

    removeTrackFromPlaylist: async (playlistId: string, trackIndex: number) => {
      const state = get()
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return

      if (trackIndex < 0 || trackIndex >= playlist.trackIds.length) return

      const newTrackIds = [...playlist.trackIds]
      newTrackIds.splice(trackIndex, 1)

      set({
        playlists: state.playlists.map((p) =>
          p.id === playlistId ? { ...p, trackIds: newTrackIds, updatedAt: Date.now() } : p
        ),
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },

    reorderPlaylistTracks: async (playlistId: string, fromIndex: number, toIndex: number) => {
      const state = get()
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return

      if (
        fromIndex < 0 ||
        fromIndex >= playlist.trackIds.length ||
        toIndex < 0 ||
        toIndex >= playlist.trackIds.length ||
        fromIndex === toIndex
      ) {
        return
      }

      const newTrackIds = [...playlist.trackIds]
      const [movedTrackId] = newTrackIds.splice(fromIndex, 1)
      newTrackIds.splice(toIndex, 0, movedTrackId)

      set({
        playlists: state.playlists.map((p) =>
          p.id === playlistId ? { ...p, trackIds: newTrackIds, updatedAt: Date.now() } : p
        ),
        error: null
      })

      // Save playlists
      await get().savePlaylists()
    },

    setCurrentPlaylist: (playlistId: string | null) => {
      set({ currentPlaylistId: playlistId })
    },

    loadPlaylists: async () => {
      try {
        set({ isLoading: true, error: null })
        const playlists = await ipcService.loadPlaylists()
        set({ playlists, isLoading: false })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load playlists'
        set({ isLoading: false, error: message })
      }
    },

    savePlaylists: async () => {
      const state = get()
      try {
        await ipcService.savePlaylists(state.playlists)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save playlists'
        set({ error: message })
      }
    },

    getPlaylistById: (playlistId: string) => {
      const state = get()
      return state.playlists.find((p) => p.id === playlistId)
    },

    getPlaylistTracks: (playlistId: string, allTracks: TrackMetadata[]) => {
      const state = get()
      const playlist = state.playlists.find((p) => p.id === playlistId)
      if (!playlist) return []

      // Map track IDs to actual tracks, preserving order
      return playlist.trackIds
        .map((id) => allTracks.find((t) => t.id === id))
        .filter((t): t is TrackMetadata => t !== undefined)
    },

    setError: (error: string | null) => {
      set({ error })
    },

    clearError: () => {
      set({ error: null })
    }
  }))
)

// Export selectors for convenience
export const selectPlaylists = (state: PlaylistStore) => state.playlists
export const selectCurrentPlaylistId = (state: PlaylistStore) => state.currentPlaylistId
export const selectIsLoading = (state: PlaylistStore) => state.isLoading
export const selectError = (state: PlaylistStore) => state.error
