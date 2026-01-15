import { useEffect, useState, useRef } from 'react'
import { useLibraryStore } from '@renderer/stores/library-store'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { usePlayerStore } from '@renderer/stores/player-store'
import { ipcService } from '@renderer/services/ipc-service'

export interface AppInitializationState {
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  progress: {
    step: 'library' | 'playlists' | 'playback' | 'done'
    message: string
  }
}

/**
 * Hook to handle app initialization and state restoration
 * Implements Requirements 8.7, 9.1, 9.2
 */
export function useAppInitialization(): AppInitializationState {
  const [state, setState] = useState<AppInitializationState>({
    isLoading: true,
    isInitialized: false,
    error: null,
    progress: {
      step: 'library',
      message: '正在加载音乐库...'
    }
  })

  const loadLibrary = useLibraryStore((s) => s.loadLibrary)
  const loadPlaylists = usePlaylistStore((s) => s.loadPlaylists)
  const restorePlaybackState = usePlayerStore((s) => s.restorePlaybackState)

  // Use ref to track if initialization has been called
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Define async initialization function inside effect
    const initialize = async (): Promise<void> => {
      try {
        // Step 1: Load library configuration
        setState((prev) => ({
          ...prev,
          progress: { step: 'library', message: '正在加载音乐库...' }
        }))
        await loadLibrary()

        // Step 2: Load playlists
        setState((prev) => ({
          ...prev,
          progress: { step: 'playlists', message: '正在加载播放列表...' }
        }))
        await loadPlaylists()

        // Step 3: Load and restore playback state
        setState((prev) => ({
          ...prev,
          progress: { step: 'playback', message: '正在恢复播放状态...' }
        }))

        try {
          const playbackState = await ipcService.loadPlaybackState()
          // Get the latest tracks from the store
          const currentTracks = useLibraryStore.getState().tracks
          await restorePlaybackState(playbackState, currentTracks)
        } catch {
          // Ignore playback state restoration errors - not critical
          console.warn('Failed to restore playback state, starting fresh')
        }

        // Done
        setState({
          isLoading: false,
          isInitialized: true,
          error: null,
          progress: { step: 'done', message: '加载完成' }
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : '初始化失败'
        setState({
          isLoading: false,
          isInitialized: false,
          error: message,
          progress: { step: 'done', message: '加载失败' }
        })
      }
    }

    // Start initialization
    void initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

/**
 * Hook to save app state before closing
 * Implements Requirements 9.1
 */
export function useAppStateSync(): void {
  const getPlaybackState = usePlayerStore((s) => s.getPlaybackState)

  useEffect(() => {
    // Save state periodically (every 30 seconds)
    const saveInterval = setInterval(async () => {
      try {
        const playbackState = getPlaybackState()
        await ipcService.savePlaybackState(playbackState)
      } catch {
        // Ignore save errors during periodic saves
      }
    }, 30000)

    // Save state on beforeunload
    const handleBeforeUnload = (): void => {
      const playbackState = getPlaybackState()
      // Use synchronous approach for beforeunload
      // Note: This may not always complete, but we have periodic saves as backup
      ipcService.savePlaybackState(playbackState).catch(() => {
        // Ignore errors during unload
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(saveInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Save state on cleanup
      const playbackState = getPlaybackState()
      ipcService.savePlaybackState(playbackState).catch(() => {
        // Ignore errors during cleanup
      })
    }
  }, [getPlaybackState])
}
