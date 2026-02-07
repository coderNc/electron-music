import { parseFile, type IAudioMetadata } from 'music-metadata'
import { basename, extname } from 'path'
import { createHash } from 'crypto'
import type { TrackMetadata } from '@shared/types'

/**
 * Generates a unique ID for a track based on its file path
 */
export function generateTrackId(filePath: string): string {
  return createHash('md5').update(filePath).digest('hex')
}

/**
 * Extracts the file format from a file path
 */
export function getFileFormat(filePath: string): string {
  return extname(filePath).slice(1).toLowerCase()
}

/**
 * Extracts the title from a file path (filename without extension)
 * Used as fallback when metadata is not available
 */
export function getTitleFromFilename(filePath: string): string {
  const filename = basename(filePath)
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * Converts cover image data to base64 data URL
 */
export function coverToBase64(picture: IAudioMetadata['common']['picture']): string | undefined {
  if (!picture || picture.length === 0) {
    return undefined
  }

  const cover = picture[0]
  const base64 = Buffer.from(cover.data).toString('base64')
  return `data:${cover.format};base64,${base64}`
}

/**
 * Parses metadata from a single audio file
 * Implements graceful degradation when metadata parsing fails (Requirements 11.3)
 *
 * @param filePath - Path to the audio file
 * @param folderId - ID of the folder containing the file
 * @returns TrackMetadata object with parsed or fallback values
 */
export async function parseAudioFile(filePath: string, folderId: string): Promise<TrackMetadata> {
  const id = generateTrackId(filePath)
  const format = getFileFormat(filePath)
  const fallbackTitle = getTitleFromFilename(filePath)

  try {
    const metadata = await parseFile(filePath)
    const { common, format: audioFormat } = metadata

    return {
      id,
      filePath,
      title: common.title || fallbackTitle,
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      albumArtist: common.albumartist,
      year: common.year,
      genre: common.genre?.[0],
      duration: audioFormat.duration || 0,
      trackNumber: common.track?.no ?? undefined,
      diskNumber: common.disk?.no ?? undefined,
      coverUrl: coverToBase64(common.picture),
      format,
      bitrate: audioFormat.bitrate,
      sampleRate: audioFormat.sampleRate,
      addedAt: Date.now(),
      folderId
    }
  } catch (error) {
    // Graceful degradation: use filename as title when parsing fails (Requirements 11.3)
    console.warn(`Failed to parse metadata for ${filePath}:`, error)

    return {
      id,
      filePath,
      title: fallbackTitle,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      format,
      addedAt: Date.now(),
      folderId
    }
  }
}

/**
 * Parses metadata from multiple audio files in batch
 *
 * @param filePaths - Array of file paths to parse
 * @param folderId - ID of the folder containing the files
 * @param onProgress - Optional callback for progress updates
 * @returns Array of TrackMetadata objects
 */
export async function parseAudioFiles(
  filePaths: string[],
  folderId: string,
  onProgress?: (current: number, total: number) => void
): Promise<TrackMetadata[]> {
  const results: TrackMetadata[] = []
  const total = filePaths.length

  for (let i = 0; i < filePaths.length; i++) {
    const track = await parseAudioFile(filePaths[i], folderId)
    results.push(track)

    if (onProgress) {
      onProgress(i + 1, total)
    }
  }

  return results
}

/**
 * Extracts cover image from an audio file
 *
 * @param filePath - Path to the audio file
 * @returns Base64 data URL of the cover image, or null if not found
 */
export async function extractCover(filePath: string): Promise<string | null> {
  try {
    const metadata = await parseFile(filePath)
    const coverUrl = coverToBase64(metadata.common.picture)
    return coverUrl || null
  } catch (error) {
    console.warn(`Failed to extract cover from ${filePath}:`, error)
    return null
  }
}

/**
 * Extracts lyrics from an audio file's metadata
 *
 * @param filePath - Path to the audio file
 * @returns Lyrics text, or null if not found
 */
export async function extractLyrics(filePath: string): Promise<string | null> {
  try {
    const metadata = await parseFile(filePath)
    // music-metadata stores lyrics in common.lyrics
    const lyrics = metadata.common.lyrics
    if (lyrics && lyrics.length > 0) {
      // Return the first lyrics entry (usually the main lyrics)
      return lyrics[0].text || (lyrics[0] as unknown as string) || null
    }
    return null
  } catch (error) {
    console.warn(`Failed to extract lyrics from ${filePath}:`, error)
    return null
  }
}

// Export the MetadataService interface for type safety
export interface MetadataService {
  parseAudioFile: typeof parseAudioFile
  parseAudioFiles: typeof parseAudioFiles
  extractCover: typeof extractCover
  extractLyrics: typeof extractLyrics
  generateTrackId: typeof generateTrackId
}

export const metadataService: MetadataService = {
  parseAudioFile,
  parseAudioFiles,
  extractCover,
  extractLyrics,
  generateTrackId
}
