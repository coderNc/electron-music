import * as React from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { useLyrics } from '@renderer/hooks/useLyrics'

interface LyricsPanelProps {
  className?: string
}

export function LyricsPanel({ className = '' }: LyricsPanelProps): React.JSX.Element {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const { lyrics, currentIndex, isLoading, error } = useLyrics(currentTrack)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (currentIndex < 0 || !containerRef.current) return
    const activeElement = containerRef.current.querySelector('[data-active="true"]')
    if (!activeElement) return
    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
      <div className="space-y-5">
        {lyrics.map((line, index) => {
          const distance = Math.abs(index - currentIndex)
          return (
            <div
              key={`${line.time}-${index}`}
              data-active={index === currentIndex}
              data-near={distance <= 1 && index !== currentIndex}
              data-dim={distance >= 3}
              className="lyric-line text-center"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{line.text || '♪'}</p>
              {line.translatedText && (
                <p className="mt-1 text-xs text-zinc-500/90 dark:text-zinc-400/90">
                  {line.translatedText}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
