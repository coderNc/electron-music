import * as React from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { formatTime } from '@renderer/utils'

export interface ProgressBarProps {
  /** Additional CSS classes */
  className?: string
  /** Maximum width class for the progress bar container */
  maxWidthClass?: string
}

/**
 * ProgressBar component
 *
 * Displays playback progress with a draggable slider and time display.
 * Connects to the Player Store for position, duration, and seek operations.
 *
 * Requirements: 3.5
 */
export function ProgressBar({
  className = '',
  maxWidthClass = 'max-w-xl'
}: ProgressBarProps): React.JSX.Element {
  const position = usePlayerStore((state) => state.position)
  const duration = usePlayerStore((state) => state.duration)
  const seek = usePlayerStore((state) => state.seek)

  const [isDragging, setIsDragging] = React.useState(false)
  const [dragPosition, setDragPosition] = React.useState(0)

  // Use drag position while dragging, otherwise use actual position
  const displayPosition = isDragging ? dragPosition : position
  const progress = duration > 0 ? (displayPosition / duration) * 100 : 0

  const handleMouseDown = (): void => {
    setIsDragging(true)
    setDragPosition(position)
  }

  const handleMouseUp = (): void => {
    if (isDragging) {
      seek(dragPosition)
      setIsDragging(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newPosition = parseFloat(e.target.value)
    if (isDragging) {
      setDragPosition(newPosition)
    } else {
      seek(newPosition)
    }
  }

  // Handle mouse up outside the slider
  React.useEffect(() => {
    if (!isDragging) {
      return
    }
    const handleGlobalMouseUp = (): void => {
      seek(dragPosition)
      setIsDragging(false)
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, dragPosition, seek])

  return (
    <div className={`flex w-full items-center gap-2 ${maxWidthClass} ${className}`}>
      <span className="w-10 text-right text-xs text-zinc-400">{formatTime(displayPosition)}</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={displayPosition}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-zinc-100"
          style={{
            background: `linear-gradient(to right, #f4f4f5 ${progress}%, #3f3f46 ${progress}%)`
          }}
          aria-label="播放进度"
          aria-valuemin={0}
          aria-valuemax={duration || 100}
          aria-valuenow={displayPosition}
          aria-valuetext={`${formatTime(displayPosition)} / ${formatTime(duration)}`}
        />
      </div>
      <span className="w-10 text-xs text-zinc-400">{formatTime(duration)}</span>
    </div>
  )
}
