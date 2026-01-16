import { ipcMain, dialog, BrowserWindow } from 'electron'
import {
  IPC_CHANNELS,
  type IPCResult,
  type LibraryConfig,
  type Playlist,
  type AppSettings,
  type PlaybackState,
  type ScanProgressEvent
} from '@shared/types'
import { fileService } from '@main/services/file-service'
import { metadataService } from '@main/services/metadata-service'
import { persistenceService } from '@main/services/persistence-service'

// Default timeout for IPC operations (30 seconds)
const DEFAULT_TIMEOUT = 30000

/**
 * Creates a standardized success response
 */
function success<T>(data: T): IPCResult<T> {
  return { success: true, data }
}

/**
 * Creates a standardized error response
 */
function error(code: string, message: string, details?: unknown): IPCResult<never> {
  return {
    success: false,
    error: { code, message, details }
  }
}

/**
 * Wraps an async operation with error handling
 */
async function handleAsync<T>(
  operation: () => Promise<T>,
  errorCode: string
): Promise<IPCResult<T>> {
  try {
    const result = await operation()
    return success(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`IPC Error [${errorCode}]:`, err)
    return error(errorCode, message, err)
  }
}

/**
 * Sends scan progress to all renderer windows
 */
function sendScanProgress(progress: ScanProgressEvent): void {
  const windows = BrowserWindow.getAllWindows()
  for (const win of windows) {
    win.webContents.send(IPC_CHANNELS.SCAN_PROGRESS, progress)
  }
}

/**
 * Registers all IPC handlers for the main process
 */
export function registerIPCHandlers(): void {
  // ============================================
  // File Operations
  // ============================================

  /**
   * Opens a folder selection dialog
   */
  ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
    return handleAsync(async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Music Folder'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      return result.filePaths[0]
    }, 'FILE_SELECT_ERROR')
  })

  /**
   * Scans a folder for audio files
   */
  ipcMain.handle(IPC_CHANNELS.SCAN_FOLDER, async (_, args: { folderPath: string }) => {
    return handleAsync(async () => {
      const { folderPath } = args
      return await fileService.scanFolder(folderPath)
    }, 'FILE_SCAN_ERROR')
  })

  /**
   * Checks if a path exists
   */
  ipcMain.handle(IPC_CHANNELS.PATH_EXISTS, async (_, args: { path: string }) => {
    return handleAsync(async () => {
      return await fileService.pathExists(args.path)
    }, 'PATH_CHECK_ERROR')
  })

  /**
   * Reads lyrics file for an audio file
   */
  ipcMain.handle(IPC_CHANNELS.READ_LYRICS, async (_, args: { audioFilePath: string }) => {
    return handleAsync(async () => {
      return await fileService.readLyrics(args.audioFilePath)
    }, 'READ_LYRICS_ERROR')
  })

  // ============================================
  // Metadata Operations
  // ============================================

  /**
   * Parses metadata from a single audio file
   */
  ipcMain.handle(
    IPC_CHANNELS.PARSE_FILE,
    async (_, args: { filePath: string; folderId: string }) => {
      return handleAsync(async () => {
        return await metadataService.parseAudioFile(args.filePath, args.folderId)
      }, 'METADATA_PARSE_ERROR')
    }
  )

  /**
   * Parses metadata from multiple audio files with progress reporting
   */
  ipcMain.handle(
    IPC_CHANNELS.PARSE_FILES,
    async (_, args: { filePaths: string[]; folderId: string }) => {
      return handleAsync(async () => {
        const { filePaths, folderId } = args

        // Progress callback to send updates to renderer
        const onProgress = (current: number, total: number): void => {
          sendScanProgress({
            current,
            total,
            currentFile: filePaths[current - 1]
          })
        }

        return await metadataService.parseAudioFiles(filePaths, folderId, onProgress)
      }, 'METADATA_BATCH_PARSE_ERROR')
    }
  )

  /**
   * Extracts cover art from an audio file
   */
  ipcMain.handle(IPC_CHANNELS.EXTRACT_COVER, async (_, args: { filePath: string }) => {
    return handleAsync(async () => {
      return await metadataService.extractCover(args.filePath)
    }, 'COVER_EXTRACT_ERROR')
  })

  // ============================================
  // Persistence Operations
  // ============================================

  /**
   * Saves library configuration
   */
  ipcMain.handle(IPC_CHANNELS.SAVE_LIBRARY_CONFIG, async (_, args: { config: LibraryConfig }) => {
    return handleAsync(async () => {
      await persistenceService.saveLibraryConfig(args.config)
    }, 'SAVE_LIBRARY_ERROR')
  })

  /**
   * Loads library configuration
   */
  ipcMain.handle(IPC_CHANNELS.LOAD_LIBRARY_CONFIG, async () => {
    return handleAsync(async () => {
      return await persistenceService.loadLibraryConfig()
    }, 'LOAD_LIBRARY_ERROR')
  })

  /**
   * Saves playlists
   */
  ipcMain.handle(IPC_CHANNELS.SAVE_PLAYLISTS, async (_, args: { playlists: Playlist[] }) => {
    return handleAsync(async () => {
      await persistenceService.savePlaylists(args.playlists)
    }, 'SAVE_PLAYLISTS_ERROR')
  })

  /**
   * Loads playlists
   */
  ipcMain.handle(IPC_CHANNELS.LOAD_PLAYLISTS, async () => {
    return handleAsync(async () => {
      return await persistenceService.loadPlaylists()
    }, 'LOAD_PLAYLISTS_ERROR')
  })

  /**
   * Saves app settings
   */
  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, async (_, args: { settings: AppSettings }) => {
    return handleAsync(async () => {
      await persistenceService.saveSettings(args.settings)
    }, 'SAVE_SETTINGS_ERROR')
  })

  /**
   * Loads app settings
   */
  ipcMain.handle(IPC_CHANNELS.LOAD_SETTINGS, async () => {
    return handleAsync(async () => {
      return await persistenceService.loadSettings()
    }, 'LOAD_SETTINGS_ERROR')
  })

  /**
   * Saves playback state
   */
  ipcMain.handle(IPC_CHANNELS.SAVE_PLAYBACK_STATE, async (_, args: { state: PlaybackState }) => {
    return handleAsync(async () => {
      await persistenceService.savePlaybackState(args.state)
    }, 'SAVE_PLAYBACK_ERROR')
  })

  /**
   * Loads playback state
   */
  ipcMain.handle(IPC_CHANNELS.LOAD_PLAYBACK_STATE, async () => {
    return handleAsync(async () => {
      return await persistenceService.loadPlaybackState()
    }, 'LOAD_PLAYBACK_ERROR')
  })

  console.log('IPC handlers registered successfully')
}

/**
 * Removes all IPC handlers (useful for testing)
 */
export function removeIPCHandlers(): void {
  Object.values(IPC_CHANNELS).forEach((channel) => {
    ipcMain.removeHandler(channel)
  })
}

export { DEFAULT_TIMEOUT }
