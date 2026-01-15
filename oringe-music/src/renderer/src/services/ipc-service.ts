import type {
  IPCResult,
  IPCError,
  LibraryConfig,
  Playlist,
  AppSettings,
  PlaybackState,
  TrackMetadata,
  ScanProgressEvent
} from '@shared/types'

/**
 * Custom error class for IPC errors
 */
export class IPCServiceError extends Error {
  code: string
  details?: unknown

  constructor(error: IPCError) {
    super(error.message)
    this.name = 'IPCServiceError'
    this.code = error.code
    this.details = error.details
  }
}

/**
 * Unwraps an IPC result, throwing an error if unsuccessful
 */
function unwrapResult<T>(result: IPCResult<T>): T {
  if (result.success) {
    return result.data
  }
  throw new IPCServiceError(result.error)
}

/**
 * Gets the IPC API from the window object
 */
function getAPI(): Window['api'] {
  if (typeof window === 'undefined' || !window.api) {
    throw new Error('IPC API not available. Are you running in Electron?')
  }
  return window.api
}

// ============================================
// File Operations
// ============================================

/**
 * Opens a folder selection dialog
 * @returns The selected folder path, or null if cancelled
 */
export async function selectFolder(): Promise<string | null> {
  const result = await getAPI().selectFolder()
  return unwrapResult(result)
}

/**
 * Scans a folder for audio files
 * @param folderPath - Path to the folder to scan
 * @returns Array of audio file paths
 */
export async function scanFolder(folderPath: string): Promise<string[]> {
  const result = await getAPI().scanFolder(folderPath)
  return unwrapResult(result)
}

/**
 * Checks if a path exists
 * @param path - Path to check
 * @returns True if the path exists
 */
export async function pathExists(path: string): Promise<boolean> {
  const result = await getAPI().pathExists(path)
  return unwrapResult(result)
}

/**
 * Reads lyrics file for an audio file
 * @param audioFilePath - Path to the audio file
 * @returns Lyrics content or null if not found
 */
export async function readLyrics(audioFilePath: string): Promise<string | null> {
  const result = await getAPI().readLyrics(audioFilePath)
  return unwrapResult(result)
}

// ============================================
// Metadata Operations
// ============================================

/**
 * Parses metadata from a single audio file
 * @param filePath - Path to the audio file
 * @param folderId - ID of the folder containing the file
 * @returns Track metadata
 */
export async function parseFile(filePath: string, folderId: string): Promise<TrackMetadata> {
  const result = await getAPI().parseFile(filePath, folderId)
  return unwrapResult(result)
}

/**
 * Parses metadata from multiple audio files
 * @param filePaths - Array of file paths
 * @param folderId - ID of the folder containing the files
 * @returns Array of track metadata
 */
export async function parseFiles(filePaths: string[], folderId: string): Promise<TrackMetadata[]> {
  const result = await getAPI().parseFiles(filePaths, folderId)
  return unwrapResult(result)
}

/**
 * Extracts cover art from an audio file
 * @param filePath - Path to the audio file
 * @returns Base64 data URL of the cover, or null if not found
 */
export async function extractCover(filePath: string): Promise<string | null> {
  const result = await getAPI().extractCover(filePath)
  return unwrapResult(result)
}

// ============================================
// Persistence Operations
// ============================================

/**
 * Saves library configuration
 * @param config - Library configuration to save
 */
export async function saveLibraryConfig(config: LibraryConfig): Promise<void> {
  const result = await getAPI().saveLibraryConfig(config)
  unwrapResult(result)
}

/**
 * Loads library configuration
 * @returns Library configuration
 */
export async function loadLibraryConfig(): Promise<LibraryConfig> {
  const result = await getAPI().loadLibraryConfig()
  return unwrapResult(result)
}

/**
 * Saves playlists
 * @param playlists - Playlists to save
 */
export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  const result = await getAPI().savePlaylists(playlists)
  unwrapResult(result)
}

/**
 * Loads playlists
 * @returns Array of playlists
 */
export async function loadPlaylists(): Promise<Playlist[]> {
  const result = await getAPI().loadPlaylists()
  return unwrapResult(result)
}

/**
 * Saves app settings
 * @param settings - Settings to save
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  const result = await getAPI().saveSettings(settings)
  unwrapResult(result)
}

/**
 * Loads app settings
 * @returns App settings
 */
export async function loadSettings(): Promise<AppSettings> {
  const result = await getAPI().loadSettings()
  return unwrapResult(result)
}

/**
 * Saves playback state
 * @param state - Playback state to save
 */
export async function savePlaybackState(state: PlaybackState): Promise<void> {
  const result = await getAPI().savePlaybackState(state)
  unwrapResult(result)
}

/**
 * Loads playback state
 * @returns Playback state
 */
export async function loadPlaybackState(): Promise<PlaybackState> {
  const result = await getAPI().loadPlaybackState()
  return unwrapResult(result)
}

// ============================================
// Event Subscriptions
// ============================================

/**
 * Subscribes to scan progress events
 * @param callback - Callback function for progress updates
 * @returns Unsubscribe function
 */
export function onScanProgress(callback: (progress: ScanProgressEvent) => void): () => void {
  return getAPI().onScanProgress(callback)
}

// ============================================
// Service Export
// ============================================

export interface IPCService {
  // File operations
  selectFolder: typeof selectFolder
  scanFolder: typeof scanFolder
  pathExists: typeof pathExists
  readLyrics: typeof readLyrics

  // Metadata operations
  parseFile: typeof parseFile
  parseFiles: typeof parseFiles
  extractCover: typeof extractCover

  // Persistence operations
  saveLibraryConfig: typeof saveLibraryConfig
  loadLibraryConfig: typeof loadLibraryConfig
  savePlaylists: typeof savePlaylists
  loadPlaylists: typeof loadPlaylists
  saveSettings: typeof saveSettings
  loadSettings: typeof loadSettings
  savePlaybackState: typeof savePlaybackState
  loadPlaybackState: typeof loadPlaybackState

  // Event subscriptions
  onScanProgress: typeof onScanProgress
}

export const ipcService: IPCService = {
  selectFolder,
  scanFolder,
  pathExists,
  readLyrics,
  parseFile,
  parseFiles,
  extractCover,
  saveLibraryConfig,
  loadLibraryConfig,
  savePlaylists,
  loadPlaylists,
  saveSettings,
  loadSettings,
  savePlaybackState,
  loadPlaybackState,
  onScanProgress
}
