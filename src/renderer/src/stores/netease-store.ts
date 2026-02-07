import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  NeteasePlaylist,
  NeteaseTrack,
  NeteaseSongUrl,
  NeteaseLoginStatus
} from '@shared/types/netease'
import { ipcService } from '@renderer/services/ipc-service'

export interface NeteaseState {
  playlists: NeteasePlaylist[]
  currentPlaylist: NeteasePlaylist | null
  isLoading: boolean
  error: string | null
  songUrlCache: Map<number, { url: string; expiresAt: number }>
  authCookie: string
  loginStatus: NeteaseLoginStatus | null
}

export interface NeteaseActions {
  importPlaylist: (input: string) => Promise<NeteasePlaylist>
  removePlaylist: (id: number) => void
  refreshPlaylist: (id: number) => Promise<NeteasePlaylist>
  renamePlaylist: (id: number, name: string) => void
  reorderPlaylists: (sourceId: number, targetId: number) => void
  setCurrentPlaylist: (playlist: NeteasePlaylist | null) => void
  getSongPlayUrl: (trackId: number) => Promise<string | null>
  prefetchSongUrls: (trackIds: number[]) => Promise<void>
  setAuthCookie: (cookie: string) => Promise<NeteaseLoginStatus>
  syncAuthCookie: () => Promise<void>
  refreshLoginStatus: () => Promise<NeteaseLoginStatus | null>
  clearAuthCookie: () => Promise<NeteaseLoginStatus>
  clearError: () => void
}

export type NeteaseStore = NeteaseState & NeteaseActions

const URL_CACHE_DURATION = 15 * 60 * 1000
const PREFETCH_BATCH_SIZE = 50
const PREFETCH_CONCURRENCY = 3
const PREFETCH_MAX_RETRIES = 2

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const initialState: NeteaseState = {
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  error: null,
  songUrlCache: new Map(),
  authCookie: '',
  loginStatus: null
}

export const useNeteaseStore = create<NeteaseStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      importPlaylist: async (input: string) => {
        set({ isLoading: true, error: null })

        try {
          const result = await ipcService.parseNeteasePlaylist(input)
          const playlist = result.playlist

          set((state) => {
            const existingIndex = state.playlists.findIndex((p) => p.id === playlist.id)
            const newPlaylists =
              existingIndex >= 0
                ? state.playlists.map((p, i) => (i === existingIndex ? playlist : p))
                : [...state.playlists, playlist]

            return {
              playlists: newPlaylists,
              currentPlaylist: playlist,
              isLoading: false
            }
          })

          return playlist
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to import playlist'
          set({ isLoading: false, error: message })
          throw error
        }
      },

      removePlaylist: (id: number) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
          currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist
        }))
      },

      refreshPlaylist: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
          const result = await ipcService.parseNeteasePlaylist(String(id))
          const playlist = result.playlist

          set((state) => ({
            playlists: state.playlists.map((p) => (p.id === id ? playlist : p)),
            currentPlaylist: state.currentPlaylist?.id === id ? playlist : state.currentPlaylist,
            isLoading: false
          }))

          return playlist
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to refresh playlist'
          set({ isLoading: false, error: message })
          throw error
        }
      },

      renamePlaylist: (id: number, name: string) => {
        const trimmed = name.trim()
        if (!trimmed) return

        set((state) => ({
          playlists: state.playlists.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
          currentPlaylist:
            state.currentPlaylist?.id === id
              ? { ...state.currentPlaylist, name: trimmed }
              : state.currentPlaylist
        }))
      },

      reorderPlaylists: (sourceId: number, targetId: number) => {
        if (sourceId === targetId) return

        set((state) => {
          const sourceIndex = state.playlists.findIndex((p) => p.id === sourceId)
          const targetIndex = state.playlists.findIndex((p) => p.id === targetId)
          if (sourceIndex < 0 || targetIndex < 0) return state

          const reordered = [...state.playlists]
          const [moved] = reordered.splice(sourceIndex, 1)
          reordered.splice(targetIndex, 0, moved)

          return { playlists: reordered }
        })
      },

      setCurrentPlaylist: (playlist: NeteasePlaylist | null) => {
        set({ currentPlaylist: playlist })
      },

      getSongPlayUrl: async (trackId: number) => {
        const state = get()
        const cached = state.songUrlCache.get(trackId)

        if (cached && cached.expiresAt > Date.now()) {
          return cached.url
        }

        try {
          const songUrl: NeteaseSongUrl = await ipcService.getNeteaseSongUrl(trackId)

          if (!songUrl.url) {
            return null
          }

          const expiresAt = Date.now() + URL_CACHE_DURATION
          set((s) => {
            const newCache = new Map(s.songUrlCache)
            newCache.set(trackId, { url: songUrl.url!, expiresAt })
            return { songUrlCache: newCache }
          })

          return songUrl.url
        } catch {
          return null
        }
      },

      prefetchSongUrls: async (trackIds: number[]) => {
        const state = get()
        const now = Date.now()

        const idsToFetch = trackIds.filter((id) => {
          const cached = state.songUrlCache.get(id)
          return !cached || cached.expiresAt <= now
        })

        if (idsToFetch.length === 0) return

        const batches: number[][] = []
        for (let i = 0; i < idsToFetch.length; i += PREFETCH_BATCH_SIZE) {
          batches.push(idsToFetch.slice(i, i + PREFETCH_BATCH_SIZE))
        }

        async function fetchBatchWithRetry(batchIds: number[]): Promise<NeteaseSongUrl[]> {
          let attempt = 0
          let delay = 250

          while (attempt <= PREFETCH_MAX_RETRIES) {
            try {
              return await ipcService.getNeteaseSongUrls(batchIds)
            } catch (error) {
              attempt += 1
              if (attempt > PREFETCH_MAX_RETRIES) {
                throw error
              }
              await wait(delay)
              delay *= 2
            }
          }

          return []
        }

        let batchIndex = 0

        async function worker(): Promise<void> {
          while (batchIndex < batches.length) {
            const currentIndex = batchIndex
            batchIndex += 1
            const batch = batches[currentIndex]

            try {
              const songUrls = await fetchBatchWithRetry(batch)
              set((s) => {
                const newCache = new Map(s.songUrlCache)
                const expiresAt = Date.now() + URL_CACHE_DURATION

                for (const item of songUrls) {
                  if (item.url) {
                    newCache.set(item.id, { url: item.url, expiresAt })
                  }
                }

                return { songUrlCache: newCache }
              })
            } catch (error) {
              console.warn('[NetEase] Prefetch batch failed', {
                batchSize: batch.length,
                error: error instanceof Error ? error.message : String(error)
              })
            }
          }
        }

        const workers = Array.from({ length: Math.min(PREFETCH_CONCURRENCY, batches.length) }, () =>
          worker()
        )
        await Promise.all(workers)
      },

      setAuthCookie: async (cookie: string) => {
        const trimmed = cookie.trim()
        const status = await ipcService.setNeteaseCookie(trimmed)
        set({ authCookie: trimmed, loginStatus: status })
        return status
      },

      syncAuthCookie: async () => {
        const { authCookie } = get()
        if (!authCookie) return
        const status = await ipcService.setNeteaseCookie(authCookie)
        set({ loginStatus: status })
      },

      refreshLoginStatus: async () => {
        try {
          const status = await ipcService.getNeteaseLoginStatus()
          set({ loginStatus: status })
          return status
        } catch {
          set({ loginStatus: null })
          return null
        }
      },

      clearAuthCookie: async () => {
        const status = await ipcService.clearNeteaseCookie()
        set({ authCookie: '', loginStatus: status })
        return status
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'netease-store',
      partialize: (state) => ({
        authCookie: state.authCookie,
        playlists: state.playlists,
        currentPlaylist: state.currentPlaylist
      })
    }
  )
)

export function neteaseTrackToPlayerTrack(track: NeteaseTrack): {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  neteaseId: number
} {
  return {
    id: `netease-${track.id}`,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    duration: track.duration / 1000,
    coverUrl: track.album.picUrl,
    neteaseId: track.id
  }
}

export const selectPlaylists = (state: NeteaseStore): NeteasePlaylist[] => state.playlists
export const selectCurrentPlaylist = (state: NeteaseStore): NeteasePlaylist | null =>
  state.currentPlaylist
export const selectIsLoading = (state: NeteaseStore): boolean => state.isLoading
export const selectError = (state: NeteaseStore): string | null => state.error
