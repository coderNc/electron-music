import * as React from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'

/**
 * Volume muted icon
 */
function VolumeMutedIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
      />
    </svg>
  )
}

/**
 * Volume low icon
 */
function VolumeLowIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  )
}

/**
 * Volume high icon
 */
function VolumeHighIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  )
}

/**
 * Get the appropriate volume icon based on volume level
 */
function getVolumeIcon(volume: number): React.JSX.Element {
  if (volume === 0) {
    return <VolumeMutedIcon />
  } else if (volume < 0.5) {
    return <VolumeLowIcon />
  } else {
    return <VolumeHighIcon />
  }
}

export interface VolumeControlProps {
  /** Additional CSS classes */
  className?: string
  /** Width class for the slider */
  sliderWidthClass?: string
}

/**
 * VolumeControl component
 *
 * Provides volume slider and mute toggle functionality.
 * Connects to the Player Store for volume state and control.
 *
 * Requirements: 3.6
 */
export function VolumeControl({
  className = '',
  sliderWidthClass = 'w-24'
}: VolumeControlProps): React.JSX.Element {
  const volume = usePlayerStore((state) => state.volume)
  const setVolume = usePlayerStore((state) => state.setVolume)

  // Store previous volume for unmute functionality
  const [previousVolume, setPreviousVolume] = React.useState(1)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0) {
      setPreviousVolume(newVolume)
    }
  }

  const toggleMute = (): void => {
    if (volume > 0) {
      setPreviousVolume(volume)
      setVolume(0)
    } else {
      setVolume(previousVolume)
    }
  }

  const volumePercent = volume * 100

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleMute}
        className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-100"
        title={volume > 0 ? '静音' : '取消静音'}
        aria-label={volume > 0 ? '静音' : '取消静音'}
      >
        {getVolumeIcon(volume)}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={handleVolumeChange}
        className={`h-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-zinc-100 ${sliderWidthClass}`}
        style={{
          background: `linear-gradient(to right, #f4f4f5 ${volumePercent}%, #3f3f46 ${volumePercent}%)`
        }}
        aria-label="音量"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volumePercent)}
        aria-valuetext={`${Math.round(volumePercent)}%`}
      />
    </div>
  )
}
