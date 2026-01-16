import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  IPC_CHANNELS,
  type IPCResult,
  type LibraryConfig,
  type Playlist,
  type AppSettings,
  type PlaybackState,
  type TrackMetadata,
  type ScanProgressEvent
} from '@shared/types'

// Default timeout for IPC operations (30 seconds)
const DEFAULT_TIMEOUT = 30000

/**
 * Type-safe IPC invoke wrapper with timeout support
 */
async function invokeWithTimeout<T>(
  channel: string,
  args?: unknown,
  timeout: number = DEFAULT_TIMEOUT
): Promise<IPCResult<T>> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: `IPC call to ${channel} timed out after ${timeout}ms`
        }
      })
    }, timeout)

    ipcRenderer
      .invoke(channel, args)
      .then((result: IPCResult<T>) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((err: Error) => {
        clearTimeout(timeoutId)
        resolve({
          success: false,
          error: {
            code: 'IPC_ERROR',
            message: err.message
          }
        })
      })
  })
}

/**
 * IPC API exposed to the renderer process
 */
const ipcAPI = {
  // ============================================
  // File Operations
  // ============================================

  /**
   * Opens a folder selection dialog
   */
  selectFolder: (): Promise<IPCResult<string | null>> => {
    return invokeWithTimeout(IPC_CHANNELS.SELECT_FOLDER)
  },

  /**
   * Scans a folder for audio files
   */
  scanFolder: (folderPath: string): Promise<IPCResult<string[]>> => {
    return invokeWithTimeout(IPC_CHANNELS.SCAN_FOLDER, { folderPath })
  },

  /**
   * Checks if a path exists
   */
  pathExists: (path: string): Promise<IPCResult<boolean>> => {
    return invokeWithTimeout(IPC_CHANNELS.PATH_EXISTS, { path })
  },

  /**
   * Reads lyrics file for an audio file
   */
  readLyrics: (audioFilePath: string): Promise<IPCResult<string | null>> => {
    return invokeWithTimeout(IPC_CHANNELS.READ_LYRICS, { audioFilePath })
  },

  // ============================================
  // Metadata Operations
  // ============================================

  /**
   * Parses metadata from a single audio file
   */
  parseFile: (filePath: string, folderId: string): Promise<IPCResult<TrackMetadata>> => {
    return invokeWithTimeout(IPC_CHANNELS.PARSE_FILE, { filePath, folderId })
  },

  /**
   * Parses metadata from multiple audio files
   */
  parseFiles: (filePaths: string[], folderId: string): Promise<IPCResult<TrackMetadata[]>> => {
    // Use longer timeout for batch operations
    const timeout = Math.max(DEFAULT_TIMEOUT, filePaths.length * 1000)
    return invokeWithTimeout(IPC_CHANNELS.PARSE_FILES, { filePaths, folderId }, timeout)
  },

  /**
   * Extracts cover art from an audio file
   */
  extractCover: (filePath: string): Promise<IPCResult<string | null>> => {
    return invokeWithTimeout(IPC_CHANNELS.EXTRACT_COVER, { filePath })
  },

  // ============================================
  // Persistence Operations
  // ============================================

  /**
   * Saves library configuration
   */
  saveLibraryConfig: (config: LibraryConfig): Promise<IPCResult<void>> => {
    return invokeWithTimeout(IPC_CHANNELS.SAVE_LIBRARY_CONFIG, { config })
  },

  /**
   * Loads library configuration
   */
  loadLibraryConfig: (): Promise<IPCResult<LibraryConfig>> => {
    return invokeWithTimeout(IPC_CHANNELS.LOAD_LIBRARY_CONFIG)
  },

  /**
   * Saves playlists
   */
  savePlaylists: (playlists: Playlist[]): Promise<IPCResult<void>> => {
    return invokeWithTimeout(IPC_CHANNELS.SAVE_PLAYLISTS, { playlists })
  },

  /**
   * Loads playlists
   */
  loadPlaylists: (): Promise<IPCResult<Playlist[]>> => {
    return invokeWithTimeout(IPC_CHANNELS.LOAD_PLAYLISTS)
  },

  /**
   * Saves app settings
   */
  saveSettings: (settings: AppSettings): Promise<IPCResult<void>> => {
    return invokeWithTimeout(IPC_CHANNELS.SAVE_SETTINGS, { settings })
  },

  /**
   * Loads app settings
   */
  loadSettings: (): Promise<IPCResult<AppSettings>> => {
    return invokeWithTimeout(IPC_CHANNELS.LOAD_SETTINGS)
  },

  /**
   * Saves playback state
   */
  savePlaybackState: (state: PlaybackState): Promise<IPCResult<void>> => {
    return invokeWithTimeout(IPC_CHANNELS.SAVE_PLAYBACK_STATE, { state })
  },

  /**
   * Loads playback state
   */
  loadPlaybackState: (): Promise<IPCResult<PlaybackState>> => {
    return invokeWithTimeout(IPC_CHANNELS.LOAD_PLAYBACK_STATE)
  },

  // ============================================
  // Event Listeners
  // ============================================

  /**
   * Subscribes to scan progress events
   */
  onScanProgress: (callback: (progress: ScanProgressEvent) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, progress: ScanProgressEvent): void => {
      callback(progress)
    }
    ipcRenderer.on(IPC_CHANNELS.SCAN_PROGRESS, handler)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SCAN_PROGRESS, handler)
    }
  }
}

// Export type for the IPC API
export type IPCAPI = typeof ipcAPI

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', ipcAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = ipcAPI
}
