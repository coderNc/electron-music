import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { LibraryConfig, Playlist, AppSettings, PlaybackState } from '@shared/types'

// Mock electron-store
const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  clear: vi.fn()
}

vi.mock('electron-store', () => {
  return {
    default: vi.fn().mockImplementation(() => mockStore)
  }
})

import {
  initializeStore,
  resetStore,
  saveLibraryConfig,
  loadLibraryConfig,
  savePlaylists,
  loadPlaylists,
  saveSettings,
  loadSettings,
  savePlaybackState,
  loadPlaybackState,
  clearAllData,
  getSchemaVersion,
  DEFAULT_LIBRARY_CONFIG,
  DEFAULT_PLAYLISTS,
  DEFAULT_SETTINGS,
  DEFAULT_PLAYBACK_STATE,
  CURRENT_SCHEMA_VERSION
} from './persistence-service'

describe('PersistenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
    // Setup default mock behavior
    mockStore.get.mockImplementation((key: string, defaultValue?: unknown) => {
      if (key === 'schemaVersion') return CURRENT_SCHEMA_VERSION
      return defaultValue
    })
    mockStore.has.mockReturnValue(true)
    // Initialize store for each test - use type assertion to bypass strict typing for mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initializeStore(mockStore as any)
  })

  describe('Library Config', () => {
    const testConfig: LibraryConfig = {
      folders: [
        {
          id: 'folder-1',
          path: '/path/to/music',
          name: 'Music',
          addedAt: Date.now(),
          trackCount: 10,
          lastScanTime: Date.now()
        }
      ],
      tracks: [],
      lastScanTime: Date.now()
    }

    it('should save library config', async () => {
      await saveLibraryConfig(testConfig)
      expect(mockStore.set).toHaveBeenCalledWith('libraryConfig', testConfig)
    })

    it('should load library config', async () => {
      mockStore.get.mockReturnValueOnce(testConfig)
      const config = await loadLibraryConfig()
      expect(config).toEqual(testConfig)
    })

    it('should return default config when data is corrupted', async () => {
      mockStore.get.mockReturnValueOnce(undefined)
      const config = await loadLibraryConfig()
      expect(config).toEqual(DEFAULT_LIBRARY_CONFIG)
    })
  })

  describe('Playlists', () => {
    const testPlaylists: Playlist[] = [
      {
        id: 'playlist-1',
        name: 'My Playlist',
        trackIds: ['track-1', 'track-2'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    it('should save playlists', async () => {
      await savePlaylists(testPlaylists)
      expect(mockStore.set).toHaveBeenCalledWith('playlists', testPlaylists)
    })

    it('should load playlists', async () => {
      mockStore.get.mockReturnValueOnce(testPlaylists)
      const playlists = await loadPlaylists()
      expect(playlists).toEqual(testPlaylists)
    })

    it('should return default playlists when data is corrupted', async () => {
      mockStore.get.mockReturnValueOnce(null)
      const playlists = await loadPlaylists()
      expect(playlists).toEqual(DEFAULT_PLAYLISTS)
    })
  })

  describe('Settings', () => {
    const testSettings: AppSettings = {
      volume: 0.5,
      playbackMode: 'shuffle',
      theme: 'dark'
    }

    it('should save settings', async () => {
      await saveSettings(testSettings)
      expect(mockStore.set).toHaveBeenCalledWith('settings', testSettings)
    })

    it('should load settings', async () => {
      mockStore.get.mockReturnValueOnce(testSettings)
      const settings = await loadSettings()
      expect(settings).toEqual(testSettings)
    })

    it('should return default settings when data is corrupted', async () => {
      mockStore.get.mockReturnValueOnce(undefined)
      const settings = await loadSettings()
      expect(settings).toEqual(DEFAULT_SETTINGS)
    })
  })

  describe('Playback State', () => {
    const testState: PlaybackState = {
      currentTrackId: 'track-1',
      position: 60,
      isPlaying: true,
      volume: 0.7,
      playbackMode: 'repeat-all',
      queueTrackIds: ['track-1', 'track-2', 'track-3'],
      queueIndex: 0
    }

    it('should save playback state', async () => {
      await savePlaybackState(testState)
      expect(mockStore.set).toHaveBeenCalledWith('playbackState', testState)
    })

    it('should load playback state', async () => {
      mockStore.get.mockReturnValueOnce(testState)
      const state = await loadPlaybackState()
      expect(state).toEqual(testState)
    })

    it('should return default state when data is corrupted', async () => {
      mockStore.get.mockReturnValueOnce(null)
      const state = await loadPlaybackState()
      expect(state).toEqual(DEFAULT_PLAYBACK_STATE)
    })
  })

  describe('Utility Functions', () => {
    it('should clear all data and reset to defaults', async () => {
      await clearAllData()
      expect(mockStore.clear).toHaveBeenCalled()
      expect(mockStore.set).toHaveBeenCalledWith('schemaVersion', CURRENT_SCHEMA_VERSION)
      expect(mockStore.set).toHaveBeenCalledWith('libraryConfig', DEFAULT_LIBRARY_CONFIG)
      expect(mockStore.set).toHaveBeenCalledWith('playlists', DEFAULT_PLAYLISTS)
      expect(mockStore.set).toHaveBeenCalledWith('settings', DEFAULT_SETTINGS)
      expect(mockStore.set).toHaveBeenCalledWith('playbackState', DEFAULT_PLAYBACK_STATE)
    })

    it('should get schema version', () => {
      mockStore.get.mockReturnValueOnce(CURRENT_SCHEMA_VERSION)
      const version = getSchemaVersion()
      expect(version).toBe(CURRENT_SCHEMA_VERSION)
    })
  })

  describe('Default Values', () => {
    it('should have correct default library config', () => {
      expect(DEFAULT_LIBRARY_CONFIG).toEqual({
        folders: [],
        tracks: [],
        lastScanTime: 0
      })
    })

    it('should have correct default playlists', () => {
      expect(DEFAULT_PLAYLISTS).toEqual([])
    })

    it('should have correct default settings', () => {
      expect(DEFAULT_SETTINGS).toEqual({
        volume: 0.8,
        playbackMode: 'sequential',
        theme: 'system'
      })
    })

    it('should have correct default playback state', () => {
      expect(DEFAULT_PLAYBACK_STATE).toEqual({
        currentTrackId: null,
        position: 0,
        isPlaying: false,
        volume: 0.8,
        playbackMode: 'sequential',
        queueTrackIds: [],
        queueIndex: 0
      })
    })
  })
})
