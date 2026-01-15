import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { useLibraryStore } from '@renderer/stores/library-store'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { toast } from '@renderer/components/feedback'

/**
 * Hook to subscribe to store errors and show toast notifications
 * Implements Requirements 1.4, 3.8, 11.1, 11.2, 11.3, 11.4
 */
export function useErrorNotifications(): void {
  // Track shown errors to avoid duplicates
  const shownErrors = useRef<Set<string>>(new Set())

  // Subscribe to player store errors
  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe(
      (state) => state.error,
      (error, prevError) => {
        if (error && error !== prevError && !shownErrors.current.has(error)) {
          shownErrors.current.add(error)

          // Show error toast with action to try next track
          toast.error(error, {
            action: {
              label: '播放下一首',
              onClick: () => {
                usePlayerStore.getState().next()
                usePlayerStore.getState().clearError()
              }
            }
          })

          // Clear from shown errors after a delay
          setTimeout(() => {
            shownErrors.current.delete(error)
          }, 10000)
        }
      }
    )

    return unsubscribe
  }, [])

  // Subscribe to library store errors
  useEffect(() => {
    const unsubscribe = useLibraryStore.subscribe(
      (state) => state.error,
      (error, prevError) => {
        if (error && error !== prevError && !shownErrors.current.has(error)) {
          shownErrors.current.add(error)

          // Determine error type and show appropriate message
          if (error.includes('not found') || error.includes('不存在')) {
            // Folder not found error - offer to remove
            toast.error(error, {
              action: {
                label: '了解',
                onClick: () => {
                  useLibraryStore.getState().clearError()
                }
              }
            })
          } else if (error.includes('already in your library') || error.includes('已在库中')) {
            // Duplicate folder warning
            toast.warning(error)
          } else {
            // Generic error
            toast.error(error)
          }

          // Clear from shown errors after a delay
          setTimeout(() => {
            shownErrors.current.delete(error)
          }, 10000)
        }
      }
    )

    return unsubscribe
  }, [])

  // Subscribe to playlist store errors
  useEffect(() => {
    const unsubscribe = usePlaylistStore.subscribe(
      (state) => state.error,
      (error, prevError) => {
        if (error && error !== prevError && !shownErrors.current.has(error)) {
          shownErrors.current.add(error)
          toast.error(error)

          // Clear from shown errors after a delay
          setTimeout(() => {
            shownErrors.current.delete(error)
          }, 10000)
        }
      }
    )

    return unsubscribe
  }, [])
}

/**
 * Hook to show success notifications for common actions
 */
export function useSuccessNotifications(): {
  notifyFolderAdded: (name: string) => void
  notifyFolderRemoved: (name: string) => void
  notifyPlaylistCreated: (name: string) => void
  notifyPlaylistDeleted: (name: string) => void
  notifyTrackAddedToPlaylist: (playlistName: string) => void
  notifyTrackAddedToQueue: () => void
} {
  return {
    notifyFolderAdded: (name: string) => {
      toast.success(`已添加文件夹: ${name}`)
    },
    notifyFolderRemoved: (name: string) => {
      toast.success(`已移除文件夹: ${name}`)
    },
    notifyPlaylistCreated: (name: string) => {
      toast.success(`已创建播放列表: ${name}`)
    },
    notifyPlaylistDeleted: (name: string) => {
      toast.success(`已删除播放列表: ${name}`)
    },
    notifyTrackAddedToPlaylist: (playlistName: string) => {
      toast.success(`已添加到播放列表: ${playlistName}`)
    },
    notifyTrackAddedToQueue: () => {
      toast.success('已添加到播放队列')
    }
  }
}
