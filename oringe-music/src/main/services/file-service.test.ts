import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  scanFolder,
  pathExists,
  isDirectory,
  hasReadPermission,
  isSupportedAudioFile,
  getFolderName
} from './file-service'

describe('FileService', () => {
  let testDir: string

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `music-player-test-${Date.now()}`)
    await fs.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('isSupportedAudioFile', () => {
    it('should return true for supported audio formats', () => {
      expect(isSupportedAudioFile('/path/to/song.mp3')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.flac')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.wav')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.aac')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.ogg')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.m4a')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.opus')).toBe(true)
    })

    it('should return false for unsupported formats', () => {
      expect(isSupportedAudioFile('/path/to/file.txt')).toBe(false)
      expect(isSupportedAudioFile('/path/to/file.jpg')).toBe(false)
      expect(isSupportedAudioFile('/path/to/file.pdf')).toBe(false)
      expect(isSupportedAudioFile('/path/to/file.exe')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(isSupportedAudioFile('/path/to/song.MP3')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.FLAC')).toBe(true)
      expect(isSupportedAudioFile('/path/to/song.Mp3')).toBe(true)
    })
  })

  describe('pathExists', () => {
    it('should return true for existing paths', async () => {
      expect(await pathExists(testDir)).toBe(true)
    })

    it('should return false for non-existing paths', async () => {
      expect(await pathExists('/non/existing/path')).toBe(false)
    })
  })

  describe('isDirectory', () => {
    it('should return true for directories', async () => {
      expect(await isDirectory(testDir)).toBe(true)
    })

    it('should return false for files', async () => {
      const filePath = join(testDir, 'test.txt')
      await fs.writeFile(filePath, 'test')
      expect(await isDirectory(filePath)).toBe(false)
    })

    it('should return false for non-existing paths', async () => {
      expect(await isDirectory('/non/existing/path')).toBe(false)
    })
  })

  describe('hasReadPermission', () => {
    it('should return true for readable paths', async () => {
      expect(await hasReadPermission(testDir)).toBe(true)
    })

    it('should return false for non-existing paths', async () => {
      expect(await hasReadPermission('/non/existing/path')).toBe(false)
    })
  })

  describe('scanFolder', () => {
    it('should find audio files in a folder', async () => {
      // Create test audio files
      await fs.writeFile(join(testDir, 'song1.mp3'), '')
      await fs.writeFile(join(testDir, 'song2.flac'), '')

      const files = await scanFolder(testDir)

      expect(files).toHaveLength(2)
      expect(files).toContain(join(testDir, 'song1.mp3'))
      expect(files).toContain(join(testDir, 'song2.flac'))
    })

    it('should recursively scan subfolders', async () => {
      // Create subfolder with audio files
      const subDir = join(testDir, 'subfolder')
      await fs.mkdir(subDir)
      await fs.writeFile(join(testDir, 'song1.mp3'), '')
      await fs.writeFile(join(subDir, 'song2.mp3'), '')

      const files = await scanFolder(testDir)

      expect(files).toHaveLength(2)
      expect(files).toContain(join(testDir, 'song1.mp3'))
      expect(files).toContain(join(subDir, 'song2.mp3'))
    })

    it('should skip unsupported files', async () => {
      await fs.writeFile(join(testDir, 'song.mp3'), '')
      await fs.writeFile(join(testDir, 'document.txt'), '')
      await fs.writeFile(join(testDir, 'image.jpg'), '')

      const files = await scanFolder(testDir)

      expect(files).toHaveLength(1)
      expect(files).toContain(join(testDir, 'song.mp3'))
    })

    it('should skip hidden files and folders', async () => {
      await fs.writeFile(join(testDir, 'song.mp3'), '')
      await fs.writeFile(join(testDir, '.hidden.mp3'), '')
      const hiddenDir = join(testDir, '.hidden')
      await fs.mkdir(hiddenDir)
      await fs.writeFile(join(hiddenDir, 'song.mp3'), '')

      const files = await scanFolder(testDir)

      expect(files).toHaveLength(1)
      expect(files).toContain(join(testDir, 'song.mp3'))
    })

    it('should throw error for non-existing folder', async () => {
      await expect(scanFolder('/non/existing/path')).rejects.toThrow('Folder does not exist')
    })

    it('should throw error for file path instead of folder', async () => {
      const filePath = join(testDir, 'test.txt')
      await fs.writeFile(filePath, 'test')

      await expect(scanFolder(filePath)).rejects.toThrow('Path is not a directory')
    })

    it('should return empty array for empty folder', async () => {
      const files = await scanFolder(testDir)
      expect(files).toHaveLength(0)
    })
  })

  describe('getFolderName', () => {
    it('should extract folder name from path', () => {
      expect(getFolderName('/path/to/Music')).toBe('Music')
      expect(getFolderName('/home/user/My Music')).toBe('My Music')
      expect(getFolderName('C:\\Users\\Music')).toBe('Music')
    })
  })
})
