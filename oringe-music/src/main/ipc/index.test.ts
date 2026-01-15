import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ipcMain, dialog } from 'electron'
import { registerIPCHandlers, removeIPCHandlers } from './index'
import { IPC_CHANNELS } from '@shared/types'
import * as fileService from '@main/services/file-service'
import * as metadataService from '@main/services/metadata-service'
import * as persistenceService from '@main/services/persistence-service'

// Mock electron modules
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn()
  },
  dialog: {
    showOpenDialog: vi.fn()
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [])
  }
}))

// Mock services
vi.mock('../services/file-service', () => ({
  fileService: {
    scanFolder: vi.fn(),
    pathExists: vi.fn()
  }
}))

vi.mock('../services/metadata-service', () => ({
  metadataService: {
    parseAudioFile: vi.fn(),
    parseAudioFiles: vi.fn(),
    extractCover: vi.fn()
  }
}))

vi.mock('../services/persistence-service', () => ({
  persistenceService: {
    saveLibraryConfig: vi.fn(),
    loadLibraryConfig: vi.fn(),
    savePlaylists: vi.fn(),
    loadPlaylists: vi.fn(),
    saveSettings: vi.fn(),
    loadSettings: vi.fn(),
    savePlaybackState: vi.fn(),
    loadPlaybackState: vi.fn()
  }
}))

describe('IPC Handlers', () => {
  // Store registered handlers for testing
  const handlers: Map<string, (...args: unknown[]) => Promise<unknown>> = new Map()

  beforeEach(() => {
    vi.clearAllMocks()
    handlers.clear()

    // Capture handlers when they're registered
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      handlers.set(channel, handler as (...args: unknown[]) => Promise<unknown>)
    })

    registerIPCHandlers()
  })

  afterEach(() => {
    removeIPCHandlers()
  })

  describe('Handler Registration', () => {
    it('should register all IPC handlers', () => {
      const expectedChannels = Object.values(IPC_CHANNELS).filter(
        (channel) => channel !== IPC_CHANNELS.SCAN_PROGRESS
      )

      for (const channel of expectedChannels) {
        expect(handlers.has(channel)).toBe(true)
      }
    })

    it('should remove all handlers when removeIPCHandlers is called', () => {
      removeIPCHandlers()

      const expectedChannels = Object.values(IPC_CHANNELS)
      expect(ipcMain.removeHandler).toHaveBeenCalledTimes(expectedChannels.length)
    })
  })

  describe('File Operations', () => {
    it('should handle SELECT_FOLDER and return selected path', async () => {
      const mockPath = '/test/music/folder'
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: [mockPath]
      })

      const handler = handlers.get(IPC_CHANNELS.SELECT_FOLDER)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({ success: true, data: mockPath })
    })

    it('should handle SELECT_FOLDER when cancelled', async () => {
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: true,
        filePaths: []
      })

      const handler = handlers.get(IPC_CHANNELS.SELECT_FOLDER)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({ success: true, data: null })
    })

    it('should handle SCAN_FOLDER', async () => {
      const mockFiles = ['/test/song1.mp3', '/test/song2.flac']
      vi.mocked(fileService.fileService.scanFolder).mockResolvedValue(mockFiles)

      const handler = handlers.get(IPC_CHANNELS.SCAN_FOLDER)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, { folderPath: '/test' })

      expect(result).toEqual({ success: true, data: mockFiles })
      expect(fileService.fileService.scanFolder).toHaveBeenCalledWith('/test')
    })

    it('should handle SCAN_FOLDER errors', async () => {
      vi.mocked(fileService.fileService.scanFolder).mockRejectedValue(new Error('Folder not found'))

      const handler = handlers.get(IPC_CHANNELS.SCAN_FOLDER)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        folderPath: '/nonexistent'
      })

      expect(result).toEqual({
        success: false,
        error: {
          code: 'FILE_SCAN_ERROR',
          message: 'Folder not found',
          details: expect.any(Error)
        }
      })
    })

    it('should handle PATH_EXISTS', async () => {
      vi.mocked(fileService.fileService.pathExists).mockResolvedValue(true)

      const handler = handlers.get(IPC_CHANNELS.PATH_EXISTS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, { path: '/test/path' })

      expect(result).toEqual({ success: true, data: true })
    })
  })

  describe('Metadata Operations', () => {
    it('should handle PARSE_FILE', async () => {
      const mockTrack = {
        id: 'test-id',
        filePath: '/test/song.mp3',
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        format: 'mp3',
        addedAt: Date.now(),
        folderId: 'folder-1'
      }
      vi.mocked(metadataService.metadataService.parseAudioFile).mockResolvedValue(mockTrack)

      const handler = handlers.get(IPC_CHANNELS.PARSE_FILE)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        filePath: '/test/song.mp3',
        folderId: 'folder-1'
      })

      expect(result).toEqual({ success: true, data: mockTrack })
    })

    it('should handle PARSE_FILES with progress', async () => {
      const mockTracks = [
        {
          id: 'test-id-1',
          filePath: '/test/song1.mp3',
          title: 'Song 1',
          artist: 'Artist',
          album: 'Album',
          duration: 180,
          format: 'mp3',
          addedAt: Date.now(),
          folderId: 'folder-1'
        }
      ]
      vi.mocked(metadataService.metadataService.parseAudioFiles).mockResolvedValue(mockTracks)

      const handler = handlers.get(IPC_CHANNELS.PARSE_FILES)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        filePaths: ['/test/song1.mp3'],
        folderId: 'folder-1'
      })

      expect(result).toEqual({ success: true, data: mockTracks })
    })

    it('should handle EXTRACT_COVER', async () => {
      const mockCover = 'data:image/jpeg;base64,/9j/4AAQ...'
      vi.mocked(metadataService.metadataService.extractCover).mockResolvedValue(mockCover)

      const handler = handlers.get(IPC_CHANNELS.EXTRACT_COVER)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        filePath: '/test/song.mp3'
      })

      expect(result).toEqual({ success: true, data: mockCover })
    })
  })

  describe('Persistence Operations', () => {
    it('should handle SAVE_LIBRARY_CONFIG', async () => {
      vi.mocked(persistenceService.persistenceService.saveLibraryConfig).mockResolvedValue()

      const config = { folders: [], tracks: [], lastScanTime: 0 }
      const handler = handlers.get(IPC_CHANNELS.SAVE_LIBRARY_CONFIG)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, { config })

      expect(result).toEqual({ success: true, data: undefined })
      expect(persistenceService.persistenceService.saveLibraryConfig).toHaveBeenCalledWith(config)
    })

    it('should handle LOAD_LIBRARY_CONFIG', async () => {
      const mockConfig = { folders: [], tracks: [], lastScanTime: 0 }
      vi.mocked(persistenceService.persistenceService.loadLibraryConfig).mockResolvedValue(
        mockConfig
      )

      const handler = handlers.get(IPC_CHANNELS.LOAD_LIBRARY_CONFIG)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({ success: true, data: mockConfig })
    })

    it('should handle SAVE_PLAYLISTS', async () => {
      vi.mocked(persistenceService.persistenceService.savePlaylists).mockResolvedValue()

      const playlists = [
        {
          id: 'playlist-1',
          name: 'My Playlist',
          trackIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
      const handler = handlers.get(IPC_CHANNELS.SAVE_PLAYLISTS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, { playlists })

      expect(result).toEqual({ success: true, data: undefined })
    })

    it('should handle LOAD_PLAYLISTS', async () => {
      const mockPlaylists = [
        {
          id: 'playlist-1',
          name: 'My Playlist',
          trackIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
      vi.mocked(persistenceService.persistenceService.loadPlaylists).mockResolvedValue(
        mockPlaylists
      )

      const handler = handlers.get(IPC_CHANNELS.LOAD_PLAYLISTS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({ success: true, data: mockPlaylists })
    })

    it('should handle SAVE_SETTINGS', async () => {
      vi.mocked(persistenceService.persistenceService.saveSettings).mockResolvedValue()

      const settings = { volume: 0.8, playbackMode: 'sequential' as const, theme: 'dark' as const }
      const handler = handlers.get(IPC_CHANNELS.SAVE_SETTINGS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, { settings })

      expect(result).toEqual({ success: true, data: undefined })
    })

    it('should handle LOAD_SETTINGS', async () => {
      const mockSettings = {
        volume: 0.8,
        playbackMode: 'sequential' as const,
        theme: 'system' as const
      }
      vi.mocked(persistenceService.persistenceService.loadSettings).mockResolvedValue(mockSettings)

      const handler = handlers.get(IPC_CHANNELS.LOAD_SETTINGS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({ success: true, data: mockSettings })
    })

    it('should handle SAVE_PLAYBACK_STATE', async () => {
      vi.mocked(persistenceService.persistenceService.savePlaybackState).mockResolvedValue()

      const state = {
        currentTrackId: null,
        position: 0,
        isPlaying: false,
        volume: 0.8,
        playbackMode: 'sequential' as const,
        queueTrackIds: [],
        queueIndex: 0
      }
      const handler = handlers.get(IPC_CHANNELS.SAVE_PLAYBACK_STATE)
      const result = await handler!({} as Electron.IpcMainInvokeEvent, { state })

      expect(result).toEqual({ success: true, data: undefined })
    })

    it('should handle LOAD_PLAYBACK_STATE', async () => {
      const mockState = {
        currentTrackId: null,
        position: 0,
        isPlaying: false,
        volume: 0.8,
        playbackMode: 'sequential' as const,
        queueTrackIds: [],
        queueIndex: 0
      }
      vi.mocked(persistenceService.persistenceService.loadPlaybackState).mockResolvedValue(
        mockState
      )

      const handler = handlers.get(IPC_CHANNELS.LOAD_PLAYBACK_STATE)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({ success: true, data: mockState })
    })
  })

  describe('Error Handling', () => {
    it('should wrap errors in standardized format', async () => {
      vi.mocked(persistenceService.persistenceService.loadSettings).mockRejectedValue(
        new Error('Storage corrupted')
      )

      const handler = handlers.get(IPC_CHANNELS.LOAD_SETTINGS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({
        success: false,
        error: {
          code: 'LOAD_SETTINGS_ERROR',
          message: 'Storage corrupted',
          details: expect.any(Error)
        }
      })
    })

    it('should handle non-Error exceptions', async () => {
      vi.mocked(persistenceService.persistenceService.loadSettings).mockRejectedValue(
        'String error'
      )

      const handler = handlers.get(IPC_CHANNELS.LOAD_SETTINGS)
      const result = await handler!({} as Electron.IpcMainInvokeEvent)

      expect(result).toEqual({
        success: false,
        error: {
          code: 'LOAD_SETTINGS_ERROR',
          message: 'Unknown error',
          details: 'String error'
        }
      })
    })
  })
})
