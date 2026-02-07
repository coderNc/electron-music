import * as React from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { ipcService } from '@renderer/services/ipc-service'

export interface LyricLine {
  time: number // seconds
  text: string
}

/**
 * Parse LRC format lyrics
 */
function parseLRC(content: string): LyricLine[] {
  const lines: LyricLine[] = []
  const regex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/g

  let match
  while ((match = regex.exec(content)) !== null) {
    const minutes = parseInt(match[1], 10)
    const seconds = parseInt(match[2], 10)
    const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
    const time = minutes * 60 + seconds + milliseconds / 1000
    const text = match[4].trim()
    lines.push({ time, text })
  }

  // Sort by time
  lines.sort((a, b) => a.time - b.time)
  return lines
}

/**
 * Hook for loading and syncing lyrics with playback
 */
export function useLyrics(filePath: string | null): {
  lyrics: LyricLine[]
  currentIndex: number
  isLoading: boolean
  error: string | null
} {
  const [lyrics, setLyrics] = React.useState<LyricLine[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const position = usePlayerStore((state) => state.position)

  // Load lyrics when file path changes
  React.useEffect(() => {
    if (!filePath) {
      setLyrics([])
      setError(null)
      return
    }

    const loadLyrics = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const content = await ipcService.readLyrics(filePath)
        if (!content) {
          setLyrics([])
          setError('No lyrics available')
        } else {
          const parsed = parseLRC(content)
          setLyrics(parsed)
        }
      } catch {
        setLyrics([])
        setError('Failed to load lyrics')
      } finally {
        setIsLoading(false)
      }
    }

    loadLyrics()
  }, [filePath])

  // Find current lyric index based on position
  const currentIndex = React.useMemo(() => {
    if (lyrics.length === 0) return -1

    // Find the last lyric that has started
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (lyrics[i].time <= position) {
        return i
      }
    }
    return -1
  }, [lyrics, position])

  return { lyrics, currentIndex, isLoading, error }
}
