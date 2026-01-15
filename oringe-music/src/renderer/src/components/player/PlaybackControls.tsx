import * as React from 'react'
import { usePlayerStore, type PlaybackMode } from '@renderer/stores/player-store'

/**
 * Icon for sequential playback mode
 */
function SequentialIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  )
}

/**
 * Icon for shuffle playback mode
 */
function ShuffleIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

/**
 * Icon for repeat-one playback mode
 */
function RepeatOneIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
      <text x="12" y="14" textAnchor="middle" fontSize="8" fill="currentColor">
        1
      </text>
    </svg>
  )
}

/**
 * Icon for repeat-all playback mode
 */
function RepeatAllIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

/**
 * Previous track icon
 */
function PreviousIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

/**
 * Next track icon
 */
function NextIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

/**
 * Play icon
 */
function PlayIcon(): React.JSX.Element {
  return (
    <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

/**
 * Pause icon
 */
function PauseIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  )
}

/**
 * Get the icon component for a playback mode
 */
function getPlaybackModeIcon(mode: PlaybackMode): React.JSX.Element {
  switch (mode) {
    case 'shuffle':
      return <ShuffleIcon />
    case 'repeat-one':
      return <RepeatOneIcon />
    case 'repeat-all':
      return <RepeatAllIcon />
    default:
      return <SequentialIcon />
  }
}

/**
 * Get the title/tooltip for a playback mode
 */
function getPlaybackModeTitle(mode: PlaybackMode): string {
  switch (mode) {
    case 'shuffle':
      return '随机播放'
    case 'repeat-one':
      return '单曲循环'
    case 'repeat-all':
      return '列表循环'
    default:
      return '顺序播放'
  }
}

/**
 * Cycle through playback modes
 */
const PLAYBACK_MODES: PlaybackMode[] = ['sequential', 'shuffle', 'repeat-one', 'repeat-all']

function getNextPlaybackMode(current: PlaybackMode): PlaybackMode {
  const currentIndex = PLAYBACK_MODES.indexOf(current)
  const nextIndex = (currentIndex + 1) % PLAYBACK_MODES.length
  return PLAYBACK_MODES[nextIndex]
}

export interface PlaybackControlsProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * PlaybackControls component
 *
 * Provides play/pause, previous, next, and playback mode controls.
 * Connects to the Player Store for state and actions.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function PlaybackControls({ className = '' }: PlaybackControlsProps): React.JSX.Element {
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const playbackMode = usePlayerStore((state) => state.playbackMode)
  const isLoading = usePlayerStore((state) => state.isLoading)
  const queue = usePlayerStore((state) => state.queue)

  const play = usePlayerStore((state) => state.play)
  const pause = usePlayerStore((state) => state.pause)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const setPlaybackMode = usePlayerStore((state) => state.setPlaybackMode)

  const handlePlayPause = (): void => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const handlePrevious = (): void => {
    previous()
  }

  const handleNext = (): void => {
    next()
  }

  const cyclePlaybackMode = (): void => {
    const nextMode = getNextPlaybackMode(playbackMode)
    setPlaybackMode(nextMode)
  }

  const hasQueue = queue.length > 0
  const isPlaybackModeActive = playbackMode !== 'sequential'

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Playback mode toggle */}
      <button
        onClick={cyclePlaybackMode}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          isPlaybackModeActive
            ? 'text-green-500 hover:text-green-400'
            : 'text-zinc-400 hover:text-zinc-100'
        }`}
        title={getPlaybackModeTitle(playbackMode)}
        aria-label={getPlaybackModeTitle(playbackMode)}
      >
        {getPlaybackModeIcon(playbackMode)}
      </button>

      {/* Previous track */}
      <button
        onClick={handlePrevious}
        disabled={!hasQueue}
        className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="上一曲"
        aria-label="上一曲"
      >
        <PreviousIcon />
      </button>

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
        title={isPlaying ? '暂停' : '播放'}
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        {isLoading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>

      {/* Next track */}
      <button
        onClick={handleNext}
        disabled={!hasQueue}
        className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="下一曲"
        aria-label="下一曲"
      >
        <NextIcon />
      </button>

      {/* Spacer for symmetry with playback mode button */}
      <div className="h-8 w-8" />
    </div>
  )
}
