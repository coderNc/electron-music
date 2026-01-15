import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { TrackMetadata, PlaybackState } from '@shared/types'
import { audioService } from '@renderer/services/audio-service'

export type PlaybackMode = 'sequential' | 'shuffle' | 'repeat-one' | 'repeat-all'

export interface PlayerState {
  // State
  currentTrack: TrackMetadata | null
  isPlaying: boolean
  position: number
  duration: number
  volume: number
  playbackMode: PlaybackMode
  queue: TrackMetadata[]
  queueIndex: number
  isLoading: boolean
  error: string | null
}

export interface PlayerActions {
  // Playback controls
  play: (track?: TrackMetadata) => Promise<void>
  pause: () => void
  stop: () => void
  next: () => Promise<void>
  previous: () => Promise<void>
  seek: (position: number) => void

  // Volume control
  setVolume: (volume: number) => void

  // Playback mode
  setPlaybackMode: (mode: PlaybackMode) => void

  // Queue management
  setQueue: (tracks: TrackMetadata[], startIndex?: number) => Promise<void>
  addToQueue: (track: TrackMetadata) => void
  addToQueueNext: (track: TrackMetadata) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  reorderQueue: (fromIndex: number, toIndex: number) => void

  // Position updates (called by audio service)
  updatePosition: (position: number) => void
  updateDuration: (duration: number) => void

  // State management
  setError: (error: string | null) => void
  clearError: () => void

  // Persistence helpers
  getPlaybackState: () => PlaybackState
  restorePlaybackState: (state: PlaybackState, tracks: TrackMetadata[]) => Promise<void>
}

export type PlayerStore = PlayerState & PlayerActions

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1,
  playbackMode: 'sequential',
  queue: [],
  queueIndex: -1,
  isLoading: false,
  error: null
}

/**
 * Gets the next track index based on playback mode
 */
function getNextIndex(
  currentIndex: number,
  queueLength: number,
  mode: PlaybackMode
): number | null {
  if (queueLength === 0) return null

  switch (mode) {
    case 'sequential':
      // Play next track, stop at end
      return currentIndex < queueLength - 1 ? currentIndex + 1 : null

    case 'shuffle': {
      // Random track (excluding current if possible)
      if (queueLength === 1) return 0
      let nextIndex: number
      do {
        nextIndex = Math.floor(Math.random() * queueLength)
      } while (nextIndex === currentIndex && queueLength > 1)
      return nextIndex
    }

    case 'repeat-one':
      // Stay on current track
      return currentIndex

    case 'repeat-all':
      // Loop back to start after last track
      return (currentIndex + 1) % queueLength

    default:
      return null
  }
}

/**
 * Gets the previous track index based on playback mode
 */
function getPreviousIndex(
  currentIndex: number,
  queueLength: number,
  mode: PlaybackMode
): number | null {
  if (queueLength === 0) return null

  switch (mode) {
    case 'sequential':
      // Play previous track, stop at beginning
      return currentIndex > 0 ? currentIndex - 1 : null

    case 'shuffle': {
      // Random track (excluding current if possible)
      if (queueLength === 1) return 0
      let prevIndex: number
      do {
        prevIndex = Math.floor(Math.random() * queueLength)
      } while (prevIndex === currentIndex && queueLength > 1)
      return prevIndex
    }

    case 'repeat-one':
      // Stay on current track
      return currentIndex

    case 'repeat-all':
      // Loop to end after first track
      return currentIndex > 0 ? currentIndex - 1 : queueLength - 1

    default:
      return null
  }
}

export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    play: async (track?: TrackMetadata) => {
      const state = get()

      // If a specific track is provided, find it in queue or add it
      if (track) {
        const existingIndex = state.queue.findIndex((t) => t.id === track.id)

        if (existingIndex >= 0) {
          // Track exists in queue, play from that position
          set({ queueIndex: existingIndex, currentTrack: track, isLoading: true, error: null })
        } else {
          // Track not in queue, set it as current and clear queue
          set({
            queue: [track],
            queueIndex: 0,
            currentTrack: track,
            isLoading: true,
            error: null
          })
        }

        try {
          await audioService.load(track.filePath)
          audioService.play()
          set({ isPlaying: true, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to play track'
          set({ isPlaying: false, isLoading: false, error: message })
        }
        return
      }

      // Resume playback if paused
      if (state.currentTrack && !state.isPlaying) {
        audioService.play()
        set({ isPlaying: true })
        return
      }

      // Start playing from queue if we have tracks
      if (state.queue.length > 0 && state.queueIndex >= 0) {
        const trackToPlay = state.queue[state.queueIndex]
        if (trackToPlay) {
          set({ currentTrack: trackToPlay, isLoading: true, error: null })
          try {
            await audioService.load(trackToPlay.filePath)
            audioService.play()
            set({ isPlaying: true, isLoading: false })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to play track'
            set({ isPlaying: false, isLoading: false, error: message })
          }
        }
      }
    },

    pause: () => {
      audioService.pause()
      set({ isPlaying: false })
    },

    stop: () => {
      audioService.stop()
      set({ isPlaying: false, position: 0 })
    },

    next: async () => {
      const state = get()
      const nextIndex = getNextIndex(state.queueIndex, state.queue.length, state.playbackMode)

      if (nextIndex === null) {
        // No next track, stop playback
        audioService.stop()
        set({ isPlaying: false, position: 0 })
        return
      }

      const nextTrack = state.queue[nextIndex]
      if (!nextTrack) return

      set({ queueIndex: nextIndex, currentTrack: nextTrack, isLoading: true, error: null })

      try {
        await audioService.load(nextTrack.filePath)
        audioService.play()
        set({ isPlaying: true, isLoading: false, position: 0 })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to play track'
        set({ isPlaying: false, isLoading: false, error: message })
        // Try to play next track on error
        if (state.playbackMode !== 'repeat-one') {
          get().next()
        }
      }
    },

    previous: async () => {
      const state = get()

      // If we're more than 3 seconds into the track, restart it
      if (state.position > 3) {
        audioService.seek(0)
        set({ position: 0 })
        return
      }

      const prevIndex = getPreviousIndex(state.queueIndex, state.queue.length, state.playbackMode)

      if (prevIndex === null) {
        // No previous track, restart current
        audioService.seek(0)
        set({ position: 0 })
        return
      }

      const prevTrack = state.queue[prevIndex]
      if (!prevTrack) return

      set({ queueIndex: prevIndex, currentTrack: prevTrack, isLoading: true, error: null })

      try {
        await audioService.load(prevTrack.filePath)
        audioService.play()
        set({ isPlaying: true, isLoading: false, position: 0 })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to play track'
        set({ isPlaying: false, isLoading: false, error: message })
      }
    },

    seek: (position: number) => {
      audioService.seek(position)
      set({ position })
    },

    setVolume: (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      audioService.setVolume(clampedVolume)
      set({ volume: clampedVolume })
    },

    setPlaybackMode: (mode: PlaybackMode) => {
      set({ playbackMode: mode })
    },

    setQueue: async (tracks: TrackMetadata[], startIndex = 0) => {
      if (tracks.length === 0) {
        set({ queue: [], queueIndex: -1, currentTrack: null })
        audioService.stop()
        set({ isPlaying: false, position: 0 })
        return
      }

      const validIndex = Math.max(0, Math.min(startIndex, tracks.length - 1))
      const trackToPlay = tracks[validIndex]

      set({
        queue: tracks,
        queueIndex: validIndex,
        currentTrack: trackToPlay,
        isLoading: true,
        error: null
      })

      try {
        await audioService.load(trackToPlay.filePath)
        audioService.play()
        set({ isPlaying: true, isLoading: false, position: 0 })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to play track'
        set({ isPlaying: false, isLoading: false, error: message })
      }
    },

    addToQueue: (track: TrackMetadata) => {
      const state = get()
      // Check if track already exists in queue
      const existingIndex = state.queue.findIndex((t) => t.id === track.id)
      if (existingIndex >= 0) return // Don't add duplicates

      set({ queue: [...state.queue, track] })

      // If queue was empty, set this as current track
      if (state.queue.length === 0) {
        set({ queueIndex: 0, currentTrack: track })
      }
    },

    addToQueueNext: (track: TrackMetadata) => {
      const state = get()
      // Check if track already exists in queue
      const existingIndex = state.queue.findIndex((t) => t.id === track.id)
      if (existingIndex >= 0) {
        // Remove from current position
        const newQueue = [...state.queue]
        newQueue.splice(existingIndex, 1)

        // Adjust queue index if needed
        let newQueueIndex = state.queueIndex
        if (existingIndex < state.queueIndex) {
          newQueueIndex--
        }

        // Insert after current track
        const insertIndex = newQueueIndex + 1
        newQueue.splice(insertIndex, 0, track)
        set({ queue: newQueue, queueIndex: newQueueIndex })
        return
      }

      // Insert after current track
      const insertIndex = state.queueIndex + 1
      const newQueue = [...state.queue]
      newQueue.splice(insertIndex, 0, track)
      set({ queue: newQueue })

      // If queue was empty, set this as current track
      if (state.queue.length === 0) {
        set({ queueIndex: 0, currentTrack: track })
      }
    },

    removeFromQueue: (index: number) => {
      const state = get()
      if (index < 0 || index >= state.queue.length) return

      const newQueue = [...state.queue]
      newQueue.splice(index, 1)

      let newQueueIndex = state.queueIndex
      let newCurrentTrack = state.currentTrack

      if (newQueue.length === 0) {
        // Queue is now empty
        newQueueIndex = -1
        newCurrentTrack = null
        audioService.stop()
        set({ isPlaying: false, position: 0 })
      } else if (index === state.queueIndex) {
        // Removed current track, play next or previous
        if (index < newQueue.length) {
          newCurrentTrack = newQueue[index]
        } else {
          newQueueIndex = newQueue.length - 1
          newCurrentTrack = newQueue[newQueueIndex]
        }
      } else if (index < state.queueIndex) {
        // Removed track before current, adjust index
        newQueueIndex--
      }

      set({ queue: newQueue, queueIndex: newQueueIndex, currentTrack: newCurrentTrack })
    },

    clearQueue: () => {
      audioService.stop()
      set({
        queue: [],
        queueIndex: -1,
        currentTrack: null,
        isPlaying: false,
        position: 0
      })
    },

    reorderQueue: (fromIndex: number, toIndex: number) => {
      const state = get()
      if (
        fromIndex < 0 ||
        fromIndex >= state.queue.length ||
        toIndex < 0 ||
        toIndex >= state.queue.length ||
        fromIndex === toIndex
      ) {
        return
      }

      const newQueue = [...state.queue]
      const [movedTrack] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, movedTrack)

      // Adjust queue index if current track was moved
      let newQueueIndex = state.queueIndex
      if (fromIndex === state.queueIndex) {
        newQueueIndex = toIndex
      } else if (fromIndex < state.queueIndex && toIndex >= state.queueIndex) {
        newQueueIndex--
      } else if (fromIndex > state.queueIndex && toIndex <= state.queueIndex) {
        newQueueIndex++
      }

      set({ queue: newQueue, queueIndex: newQueueIndex })
    },

    updatePosition: (position: number) => {
      set({ position })
    },

    updateDuration: (duration: number) => {
      set({ duration })
    },

    setError: (error: string | null) => {
      set({ error })
    },

    clearError: () => {
      set({ error: null })
    },

    getPlaybackState: (): PlaybackState => {
      const state = get()
      return {
        currentTrackId: state.currentTrack?.id ?? null,
        position: state.position,
        isPlaying: state.isPlaying,
        volume: state.volume,
        playbackMode: state.playbackMode,
        queueTrackIds: state.queue.map((t) => t.id),
        queueIndex: state.queueIndex
      }
    },

    restorePlaybackState: async (playbackState: PlaybackState, tracks: TrackMetadata[]) => {
      // Build queue from track IDs
      const queue = playbackState.queueTrackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is TrackMetadata => t !== undefined)

      const currentTrack =
        playbackState.currentTrackId !== null
          ? (tracks.find((t) => t.id === playbackState.currentTrackId) ?? null)
          : null

      set({
        queue,
        queueIndex: playbackState.queueIndex,
        currentTrack,
        volume: playbackState.volume,
        playbackMode: playbackState.playbackMode,
        position: playbackState.position,
        isPlaying: false // Don't auto-play on restore
      })

      // Set volume
      audioService.setVolume(playbackState.volume)

      // Load the current track if there is one
      if (currentTrack) {
        try {
          await audioService.load(currentTrack.filePath)
          audioService.seek(playbackState.position)
        } catch {
          // Ignore load errors on restore
        }
      }
    }
  }))
)

// Set up audio service event listeners
audioService.onProgress((position) => {
  usePlayerStore.getState().updatePosition(position)
})

audioService.onLoad((duration) => {
  usePlayerStore.getState().updateDuration(duration)
})

audioService.onEnd(() => {
  // Auto-play next track when current ends
  usePlayerStore.getState().next()
})

audioService.onError((error) => {
  usePlayerStore.getState().setError(error.message)
})

// Export selectors for convenience
export const selectCurrentTrack = (state: PlayerStore): TrackMetadata | null => state.currentTrack
export const selectIsPlaying = (state: PlayerStore): boolean => state.isPlaying
export const selectPosition = (state: PlayerStore): number => state.position
export const selectDuration = (state: PlayerStore): number => state.duration
export const selectVolume = (state: PlayerStore): number => state.volume
export const selectPlaybackMode = (state: PlayerStore): PlaybackMode => state.playbackMode
export const selectQueue = (state: PlayerStore): TrackMetadata[] => state.queue
export const selectQueueIndex = (state: PlayerStore): number => state.queueIndex
export const selectIsLoading = (state: PlayerStore): boolean => state.isLoading
export const selectError = (state: PlayerStore): string | null => state.error
