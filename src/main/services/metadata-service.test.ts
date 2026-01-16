import { describe, it, expect, vi } from 'vitest'
import type { IAudioMetadata, IPicture } from 'music-metadata'
import {
  generateTrackId,
  getFileFormat,
  getTitleFromFilename,
  coverToBase64,
  parseAudioFile,
  parseAudioFiles
} from './metadata-service'

// Mock music-metadata module
vi.mock('music-metadata', () => ({
  parseFile: vi.fn()
}))

import { parseFile } from 'music-metadata'

const mockParseFile = vi.mocked(parseFile)

// Helper to create mock metadata
function createMockMetadata(
  common: Partial<IAudioMetadata['common']> = {},
  format: Partial<IAudioMetadata['format']> = {}
): IAudioMetadata {
  return {
    common: {
      track: { no: null, of: null },
      disk: { no: null, of: null },
      ...common
    },
    format: {
      tagTypes: [],
      ...format
    },
    native: {},
    quality: { warnings: [] }
  } as IAudioMetadata
}

describe('MetadataService', () => {
  describe('generateTrackId', () => {
    it('should generate consistent IDs for the same path', () => {
      const path = '/path/to/song.mp3'
      const id1 = generateTrackId(path)
      const id2 = generateTrackId(path)
      expect(id1).toBe(id2)
    })

    it('should generate different IDs for different paths', () => {
      const id1 = generateTrackId('/path/to/song1.mp3')
      const id2 = generateTrackId('/path/to/song2.mp3')
      expect(id1).not.toBe(id2)
    })

    it('should generate valid hex strings', () => {
      const id = generateTrackId('/path/to/song.mp3')
      expect(id).toMatch(/^[a-f0-9]{32}$/)
    })
  })

  describe('getFileFormat', () => {
    it('should extract format from file path', () => {
      expect(getFileFormat('/path/to/song.mp3')).toBe('mp3')
      expect(getFileFormat('/path/to/song.flac')).toBe('flac')
      expect(getFileFormat('/path/to/song.wav')).toBe('wav')
    })

    it('should handle uppercase extensions', () => {
      expect(getFileFormat('/path/to/song.MP3')).toBe('mp3')
      expect(getFileFormat('/path/to/song.FLAC')).toBe('flac')
    })
  })

  describe('getTitleFromFilename', () => {
    it('should extract title from filename', () => {
      expect(getTitleFromFilename('/path/to/My Song.mp3')).toBe('My Song')
      expect(getTitleFromFilename('/path/to/Artist - Title.flac')).toBe('Artist - Title')
    })

    it('should handle filenames with multiple dots', () => {
      expect(getTitleFromFilename('/path/to/Song.v2.mp3')).toBe('Song.v2')
    })
  })

  describe('coverToBase64', () => {
    it('should return undefined for empty picture array', () => {
      expect(coverToBase64([])).toBeUndefined()
      expect(coverToBase64(undefined)).toBeUndefined()
    })

    it('should convert picture to base64 data URL', () => {
      const picture: IPicture[] = [
        {
          format: 'image/jpeg',
          data: Buffer.from('test-image-data')
        }
      ]
      const result = coverToBase64(picture)
      expect(result).toMatch(/^data:image\/jpeg;base64,/)
    })
  })

  describe('parseAudioFile', () => {
    it('should parse metadata from audio file', async () => {
      mockParseFile.mockResolvedValueOnce(
        createMockMetadata(
          {
            title: 'Test Song',
            artist: 'Test Artist',
            album: 'Test Album',
            year: 2023,
            genre: ['Rock'],
            track: { no: 1, of: 10 },
            disk: { no: 1, of: 1 },
            picture: []
          },
          {
            duration: 180,
            bitrate: 320000,
            sampleRate: 44100
          }
        )
      )

      const track = await parseAudioFile('/path/to/song.mp3', 'folder-1')

      expect(track.title).toBe('Test Song')
      expect(track.artist).toBe('Test Artist')
      expect(track.album).toBe('Test Album')
      expect(track.year).toBe(2023)
      expect(track.genre).toBe('Rock')
      expect(track.duration).toBe(180)
      expect(track.trackNumber).toBe(1)
      expect(track.folderId).toBe('folder-1')
    })

    it('should use fallback values when metadata is missing', async () => {
      mockParseFile.mockResolvedValueOnce(createMockMetadata({}, {}))

      const track = await parseAudioFile('/path/to/My Song.mp3', 'folder-1')

      expect(track.title).toBe('My Song')
      expect(track.artist).toBe('Unknown Artist')
      expect(track.album).toBe('Unknown Album')
      expect(track.duration).toBe(0)
    })

    it('should gracefully handle parsing errors (Requirements 11.3)', async () => {
      mockParseFile.mockRejectedValueOnce(new Error('Parse error'))

      const track = await parseAudioFile('/path/to/Corrupted File.mp3', 'folder-1')

      expect(track.title).toBe('Corrupted File')
      expect(track.artist).toBe('Unknown Artist')
      expect(track.album).toBe('Unknown Album')
      expect(track.format).toBe('mp3')
    })
  })

  describe('parseAudioFiles', () => {
    it('should parse multiple files', async () => {
      mockParseFile
        .mockResolvedValueOnce(createMockMetadata({ title: 'Song 1' }, { duration: 100 }))
        .mockResolvedValueOnce(createMockMetadata({ title: 'Song 2' }, { duration: 200 }))

      const tracks = await parseAudioFiles(['/path/to/song1.mp3', '/path/to/song2.mp3'], 'folder-1')

      expect(tracks).toHaveLength(2)
      expect(tracks[0].title).toBe('Song 1')
      expect(tracks[1].title).toBe('Song 2')
    })

    it('should call progress callback', async () => {
      mockParseFile.mockResolvedValue(createMockMetadata({ title: 'Song' }, { duration: 100 }))

      const onProgress = vi.fn()
      await parseAudioFiles(
        ['/path/to/song1.mp3', '/path/to/song2.mp3', '/path/to/song3.mp3'],
        'folder-1',
        onProgress
      )

      expect(onProgress).toHaveBeenCalledTimes(3)
      expect(onProgress).toHaveBeenCalledWith(1, 3)
      expect(onProgress).toHaveBeenCalledWith(2, 3)
      expect(onProgress).toHaveBeenCalledWith(3, 3)
    })

    it('should continue parsing even if some files fail', async () => {
      mockParseFile
        .mockResolvedValueOnce(createMockMetadata({ title: 'Song 1' }, { duration: 100 }))
        .mockRejectedValueOnce(new Error('Parse error'))
        .mockResolvedValueOnce(createMockMetadata({ title: 'Song 3' }, { duration: 300 }))

      const tracks = await parseAudioFiles(
        ['/path/to/song1.mp3', '/path/to/corrupted.mp3', '/path/to/song3.mp3'],
        'folder-1'
      )

      expect(tracks).toHaveLength(3)
      expect(tracks[0].title).toBe('Song 1')
      expect(tracks[1].title).toBe('corrupted') // Fallback to filename
      expect(tracks[2].title).toBe('Song 3')
    })
  })
})
