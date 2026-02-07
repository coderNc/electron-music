import * as React from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { ipcService } from '@renderer/services/ipc-service'
import type { TrackMetadata } from '@shared/types'

export interface LyricLine {
  time: number // seconds
  timeMs: number
  text: string
  translatedText?: string
}

/**
 * Parse LRC format lyrics
 */
function parseLRC(content: string): LyricLine[] {
  const lines: LyricLine[] = []
  const timestampPattern = /\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g

  for (const rawLine of content.split(/\r?\n/)) {
    const matches = [...rawLine.matchAll(timestampPattern)]
    if (matches.length === 0) continue

    const text = rawLine.replace(timestampPattern, '').trim()
    for (const match of matches) {
      const minutes = Number.parseInt(match[1], 10)
      const seconds = Number.parseInt(match[2], 10)
      const milliseconds = match[3] ? Number.parseInt(match[3].padEnd(3, '0'), 10) : 0
      const timeMs = minutes * 60_000 + seconds * 1000 + milliseconds
      lines.push({ time: timeMs / 1000, timeMs, text })
    }
  }

  // Sort by time
  lines.sort((a, b) => a.time - b.time)
  return lines
}

function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

function mergeTranslatedLyrics(main: LyricLine[], translatedContent: string | null): LyricLine[] {
  if (!translatedContent) return main

  const translatedLines = parseLRC(translatedContent)
  if (translatedLines.length === 0) return main

  const translatedByTime = new Map(translatedLines.map((line) => [line.timeMs, line.text]))
  return main.map((line) => {
    const translatedText = translatedByTime.get(line.timeMs)?.trim()
    if (!translatedText || hasChinese(line.text)) {
      return line
    }

    return { ...line, translatedText }
  })
}

/**
 * Hook for loading and syncing lyrics with playback
 */
function extractNeteaseTrackId(track: TrackMetadata | null): number | null {
  if (!track) return null
  if (track.folderId !== 'netease') return null
  const match = track.id.match(/^netease-(\d+)$/)
  if (!match) return null
  return Number.parseInt(match[1], 10)
}

export function useLyrics(track: TrackMetadata | null): {
  lyrics: LyricLine[]
  currentIndex: number
  isLoading: boolean
  error: string | null
} {
  const [lyrics, setLyrics] = React.useState<LyricLine[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const position = usePlayerStore((state) => state.position)

  const trackId = track?.id ?? null

  // Load lyrics when track changes
  React.useEffect(() => {
    if (!track) {
      setLyrics([])
      setError(null)
      return
    }

    const loadLyrics = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        let content: string | null = null
        const neteaseTrackId = extractNeteaseTrackId(track)

        if (neteaseTrackId) {
          const lyric = await ipcService.getNeteaseSongLyric(neteaseTrackId)
          content = lyric.lyric
          if (content) {
            const parsed = parseLRC(content)
            setLyrics(mergeTranslatedLyrics(parsed, lyric.translatedLyric))
            return
          }
        } else {
          content = await ipcService.readLyrics(track.filePath)
        }

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
  }, [track, trackId])

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
