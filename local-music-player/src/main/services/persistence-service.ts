import Store from 'electron-store'
import type { LibraryConfig, Playlist, AppSettings, PlaybackState } from '../../shared/types'

// Current data schema version for migration support
const CURRENT_SCHEMA_VERSION = 1

// Store schema interface
interface StoreSchema {
  schemaVersion: number
  libraryConfig: LibraryConfig
  playlists: Playlist[]
  settings: AppSettings
  playbackState: PlaybackState
}

// Default values
const DEFAULT_LIBRARY_CONFIG: LibraryConfig = {
  folders: [],
  tracks: [],
  lastScanTime: 0
}

const DEFAULT_PLAYLISTS: Playlist[] = []

const DEFAULT_SETTINGS: AppSettings = {
  volume: 0.8,
  playbackMode: 'sequential',
  theme: 'system'
}

const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  currentTrackId: null,
  position: 0,
  isPlaying: false,
  volume: 0.8,
  playbackMode: 'sequential',
  queueTrackIds: [],
  queueIndex: 0
}

// Create the store instance with defaults
let store: Store<StoreSchema> | null = null

/**
 * Initializes the store instance
 * Separated for testing purposes
 */
export function initializeStore(customStore?: Store<StoreSchema>): Store<StoreSchema> {
  if (customStore) {
    store = customStore
    return store
  }

  if (!store) {
    store = new Store<StoreSchema>({
      name: 'music-player-data',
      defaults: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        libraryConfig: DEFAULT_LIBRARY_CONFIG,
        playlists: DEFAULT_PLAYLISTS,
        settings: DEFAULT_SETTINGS,
        playbackState: DEFAULT_PLAYBACK_STATE
      }
    })

    // Run migrations if needed
    migrateData(store)
  }

  return store
}

/**
 * Gets the store instance, initializing if needed
 */
function getStore(): Store<StoreSchema> {
  if (!store) {
    return initializeStore()
  }
  return store
}

/**
 * Migrates data from older schema versions to current version
 * Implements Requirements 9.6 - automatic data migration
 */
function migrateData(storeInstance: Store<StoreSchema>): void {
  const storedVersion = storeInstance.get('schemaVersion', 0)

  if (storedVersion < CURRENT_SCHEMA_VERSION) {
    // Migration from version 0 to 1 (initial setup)
    if (storedVersion < 1) {
      // Ensure all required fields exist with defaults
      if (!storeInstance.has('libraryConfig')) {
        storeInstance.set('libraryConfig', DEFAULT_LIBRARY_CONFIG)
      }
      if (!storeInstance.has('playlists')) {
        storeInstance.set('playlists', DEFAULT_PLAYLISTS)
      }
      if (!storeInstance.has('settings')) {
        storeInstance.set('settings', DEFAULT_SETTINGS)
      }
      if (!storeInstance.has('playbackState')) {
        storeInstance.set('playbackState', DEFAULT_PLAYBACK_STATE)
      }
    }

    // Update schema version after migration
    storeInstance.set('schemaVersion', CURRENT_SCHEMA_VERSION)
    console.log(`Migrated data from version ${storedVersion} to ${CURRENT_SCHEMA_VERSION}`)
  }
}

/**
 * Validates and repairs data if corrupted
 * Implements Requirements 9.5 - data corruption recovery
 */
function validateAndRepair<T>(data: T | undefined, defaultValue: T, name: string): T {
  if (data === undefined || data === null) {
    console.warn(`${name} was corrupted or missing, using default value`)
    return defaultValue
  }
  return data
}

// ============================================
// Library Config Operations (Requirements 1.3, 9.4)
// ============================================

/**
 * Saves the music library configuration
 */
export async function saveLibraryConfig(config: LibraryConfig): Promise<void> {
  try {
    getStore().set('libraryConfig', config)
  } catch (error) {
    console.error('Failed to save library config:', error)
    throw new Error('Failed to save library configuration')
  }
}

/**
 * Loads the music library configuration
 */
export async function loadLibraryConfig(): Promise<LibraryConfig> {
  try {
    const config = getStore().get('libraryConfig')
    return validateAndRepair(config, DEFAULT_LIBRARY_CONFIG, 'libraryConfig')
  } catch (error) {
    console.error('Failed to load library config:', error)
    return DEFAULT_LIBRARY_CONFIG
  }
}

// ============================================
// Playlist Operations (Requirements 9.3)
// ============================================

/**
 * Saves all playlists
 */
export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  try {
    getStore().set('playlists', playlists)
  } catch (error) {
    console.error('Failed to save playlists:', error)
    throw new Error('Failed to save playlists')
  }
}

/**
 * Loads all playlists
 */
export async function loadPlaylists(): Promise<Playlist[]> {
  try {
    const playlists = getStore().get('playlists')
    return validateAndRepair(playlists, DEFAULT_PLAYLISTS, 'playlists')
  } catch (error) {
    console.error('Failed to load playlists:', error)
    return DEFAULT_PLAYLISTS
  }
}

// ============================================
// App Settings Operations (Requirements 9.2)
// ============================================

/**
 * Saves application settings
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    getStore().set('settings', settings)
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw new Error('Failed to save settings')
  }
}

/**
 * Loads application settings
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const settings = getStore().get('settings')
    return validateAndRepair(settings, DEFAULT_SETTINGS, 'settings')
  } catch (error) {
    console.error('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

// ============================================
// Playback State Operations (Requirements 9.1)
// ============================================

/**
 * Saves the current playback state
 */
export async function savePlaybackState(state: PlaybackState): Promise<void> {
  try {
    getStore().set('playbackState', state)
  } catch (error) {
    console.error('Failed to save playback state:', error)
    throw new Error('Failed to save playback state')
  }
}

/**
 * Loads the playback state
 */
export async function loadPlaybackState(): Promise<PlaybackState> {
  try {
    const state = getStore().get('playbackState')
    return validateAndRepair(state, DEFAULT_PLAYBACK_STATE, 'playbackState')
  } catch (error) {
    console.error('Failed to load playback state:', error)
    return DEFAULT_PLAYBACK_STATE
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Clears all stored data (useful for testing or reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    getStore().clear()
    // Re-initialize with defaults
    getStore().set('schemaVersion', CURRENT_SCHEMA_VERSION)
    getStore().set('libraryConfig', DEFAULT_LIBRARY_CONFIG)
    getStore().set('playlists', DEFAULT_PLAYLISTS)
    getStore().set('settings', DEFAULT_SETTINGS)
    getStore().set('playbackState', DEFAULT_PLAYBACK_STATE)
  } catch (error) {
    console.error('Failed to clear data:', error)
    throw new Error('Failed to clear data')
  }
}

/**
 * Gets the current schema version
 */
export function getSchemaVersion(): number {
  return getStore().get('schemaVersion', CURRENT_SCHEMA_VERSION)
}

/**
 * Resets the store instance (for testing)
 */
export function resetStore(): void {
  store = null
}

// Export the PersistenceService interface for type safety
export interface PersistenceService {
  saveLibraryConfig: typeof saveLibraryConfig
  loadLibraryConfig: typeof loadLibraryConfig
  savePlaylists: typeof savePlaylists
  loadPlaylists: typeof loadPlaylists
  saveSettings: typeof saveSettings
  loadSettings: typeof loadSettings
  savePlaybackState: typeof savePlaybackState
  loadPlaybackState: typeof loadPlaybackState
  clearAllData: typeof clearAllData
  getSchemaVersion: typeof getSchemaVersion
}

export const persistenceService: PersistenceService = {
  saveLibraryConfig,
  loadLibraryConfig,
  savePlaylists,
  loadPlaylists,
  saveSettings,
  loadSettings,
  savePlaybackState,
  loadPlaybackState,
  clearAllData,
  getSchemaVersion
}

// Export defaults for testing
export {
  DEFAULT_LIBRARY_CONFIG,
  DEFAULT_PLAYLISTS,
  DEFAULT_SETTINGS,
  DEFAULT_PLAYBACK_STATE,
  CURRENT_SCHEMA_VERSION
}
