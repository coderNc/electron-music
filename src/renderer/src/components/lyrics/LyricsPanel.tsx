import * as React from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { useLyrics } from '@renderer/hooks/useLyrics'

interface LyricsPanelProps {
  className?: string
}

export function LyricsPanel({ className = '' }: LyricsPanelProps): React.JSX.Element {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const { lyrics, currentIndex, isLoading, error } = useLyrics(currentTrack?.filePath ?? null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to current lyric
  React.useEffect(() => {
    if (currentIndex >= 0 && containerRef.current) {
      const activeElement = containerRef.current.querySelector('[data-active="true"]')
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentIndex])

  if (!currentTrack) {
    return (
      <div
        className={`flex items-center justify-center text-zinc-500 dark:text-zinc-400 ${className}`}
      >
        <p>选择一首歌曲开始播放</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center text-zinc-500 dark:text-zinc-400 ${className}`}
      >
        <p>加载歌词中...</p>
      </div>
    )
  }

  if (error || lyrics.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-zinc-500 dark:text-zinc-400 ${className}`}
      >
        <p>暂无歌词</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`overflow-y-auto px-4 py-8 ${className}`}>
      <div className="space-y-4">
        {lyrics.map((line, index) => (
          <p
            key={`${line.time}-${index}`}
            data-active={index === currentIndex}
            className={`text-center transition-all duration-300 ${
              index === currentIndex
                ? 'text-lg font-medium text-orange-500 dark:text-orange-400'
                : 'text-sm text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {line.text || '♪'}
          </p>
        ))}
      </div>
    </div>
  )
}
