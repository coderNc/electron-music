// Core data types for the music player

export interface TrackMetadata {
  id: string
  filePath: string
  title: string
  artist: string
  album: string
  albumArtist?: string
  year?: number
  genre?: string
  duration: number // in seconds
  trackNumber?: number
  diskNumber?: number
  coverUrl?: string // base64 or blob URL
  format: string
  bitrate?: number
  sampleRate?: number
  addedAt: number
  folderId: string
}

export interface FolderInfo {
  id: string
  path: string
  name: string
  addedAt: number
  trackCount: number
  lastScanTime: number
}

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export interface PlaybackState {
  currentTrackId: string | null
  position: number
  isPlaying: boolean
  volume: number
  playbackMode: 'sequential' | 'shuffle' | 'repeat-one' | 'repeat-all'
  queueTrackIds: string[]
  queueIndex: number
}

export interface LibraryConfig {
  folders: FolderInfo[]
  tracks: TrackMetadata[]
  lastScanTime: number
}

export interface AppSettings {
  volume: number
  playbackMode: 'sequential' | 'shuffle' | 'repeat-one' | 'repeat-all'
  theme: 'light' | 'dark' | 'system'
}

export interface Album {
  name: string
  artist: string
  year?: number
  trackCount: number
  tracks: TrackMetadata[]
  coverData?: string // base64
}

export interface Artist {
  name: string
  albumCount: number
  trackCount: number
  albums: Album[]
}

export interface FileChangeEvent {
  type: 'added' | 'removed' | 'modified'
  filePath: string
}

// ============================================
// IPC Channel Definitions
// ============================================

/**
 * IPC channel names for type-safe communication
 */
export const IPC_CHANNELS = {
  // File operations
  SELECT_FOLDER: 'file:select-folder',
  SCAN_FOLDER: 'file:scan-folder',
  PATH_EXISTS: 'file:path-exists',
  READ_LYRICS: 'file:read-lyrics',

  // Metadata operations
  PARSE_FILE: 'metadata:parse-file',
  PARSE_FILES: 'metadata:parse-files',
  EXTRACT_COVER: 'metadata:extract-cover',

  // Persistence operations
  SAVE_LIBRARY_CONFIG: 'persistence:save-library-config',
  LOAD_LIBRARY_CONFIG: 'persistence:load-library-config',
  SAVE_PLAYLISTS: 'persistence:save-playlists',
  LOAD_PLAYLISTS: 'persistence:load-playlists',
  SAVE_SETTINGS: 'persistence:save-settings',
  LOAD_SETTINGS: 'persistence:load-settings',
  SAVE_PLAYBACK_STATE: 'persistence:save-playback-state',
  LOAD_PLAYBACK_STATE: 'persistence:load-playback-state',

  // Progress events (main -> renderer)
  SCAN_PROGRESS: 'scan:progress'
} as const

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

/**
 * IPC request/response types for each channel
 */
export interface IPCRequestMap {
  [IPC_CHANNELS.SELECT_FOLDER]: void
  [IPC_CHANNELS.SCAN_FOLDER]: { folderPath: string }
  [IPC_CHANNELS.PATH_EXISTS]: { path: string }
  [IPC_CHANNELS.READ_LYRICS]: { audioFilePath: string }
  [IPC_CHANNELS.PARSE_FILE]: { filePath: string; folderId: string }
  [IPC_CHANNELS.PARSE_FILES]: { filePaths: string[]; folderId: string }
  [IPC_CHANNELS.EXTRACT_COVER]: { filePath: string }
  [IPC_CHANNELS.SAVE_LIBRARY_CONFIG]: { config: LibraryConfig }
  [IPC_CHANNELS.LOAD_LIBRARY_CONFIG]: void
  [IPC_CHANNELS.SAVE_PLAYLISTS]: { playlists: Playlist[] }
  [IPC_CHANNELS.LOAD_PLAYLISTS]: void
  [IPC_CHANNELS.SAVE_SETTINGS]: { settings: AppSettings }
  [IPC_CHANNELS.LOAD_SETTINGS]: void
  [IPC_CHANNELS.SAVE_PLAYBACK_STATE]: { state: PlaybackState }
  [IPC_CHANNELS.LOAD_PLAYBACK_STATE]: void
}

export interface IPCResponseMap {
  [IPC_CHANNELS.SELECT_FOLDER]: string | null
  [IPC_CHANNELS.SCAN_FOLDER]: string[]
  [IPC_CHANNELS.PATH_EXISTS]: boolean
  [IPC_CHANNELS.READ_LYRICS]: string | null
  [IPC_CHANNELS.PARSE_FILE]: TrackMetadata
  [IPC_CHANNELS.PARSE_FILES]: TrackMetadata[]
  [IPC_CHANNELS.EXTRACT_COVER]: string | null
  [IPC_CHANNELS.SAVE_LIBRARY_CONFIG]: void
  [IPC_CHANNELS.LOAD_LIBRARY_CONFIG]: LibraryConfig
  [IPC_CHANNELS.SAVE_PLAYLISTS]: void
  [IPC_CHANNELS.LOAD_PLAYLISTS]: Playlist[]
  [IPC_CHANNELS.SAVE_SETTINGS]: void
  [IPC_CHANNELS.LOAD_SETTINGS]: AppSettings
  [IPC_CHANNELS.SAVE_PLAYBACK_STATE]: void
  [IPC_CHANNELS.LOAD_PLAYBACK_STATE]: PlaybackState
}

/**
 * IPC error response structure
 */
export interface IPCError {
  code: string
  message: string
  details?: unknown
}

/**
 * IPC result wrapper for consistent error handling
 */
export type IPCResult<T> = { success: true; data: T } | { success: false; error: IPCError }

/**
 * Scan progress event data
 */
export interface ScanProgressEvent {
  current: number
  total: number
  currentFile?: string
}
