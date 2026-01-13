import { promises as fs, watch, FSWatcher } from 'fs'
import { join, extname, basename } from 'path'
import type { FileChangeEvent } from '../../shared/types'

// Supported audio file extensions
const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.flac',
  '.wav',
  '.aac',
  '.ogg',
  '.m4a',
  '.wma',
  '.aiff',
  '.alac',
  '.opus'
])

/**
 * Checks if a file extension is a supported audio format
 */
export function isSupportedAudioFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase()
  return SUPPORTED_AUDIO_EXTENSIONS.has(ext)
}

/**
 * Validates if a path exists and is accessible
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Checks if a path is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path)
    return stats.isDirectory()
  } catch {
    return false
  }
}

/**
 * Validates path permissions (read access)
 */
export async function hasReadPermission(path: string): Promise<boolean> {
  try {
    await fs.access(path, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Recursively scans a folder for audio files
 * @param folderPath - The path to the folder to scan
 * @returns Array of audio file paths found in the folder and subfolders
 */
export async function scanFolder(folderPath: string): Promise<string[]> {
  const audioFiles: string[] = []

  // Validate the folder path exists and is accessible
  if (!(await pathExists(folderPath))) {
    throw new Error(`Folder does not exist: ${folderPath}`)
  }

  if (!(await isDirectory(folderPath))) {
    throw new Error(`Path is not a directory: ${folderPath}`)
  }

  if (!(await hasReadPermission(folderPath))) {
    throw new Error(`No read permission for folder: ${folderPath}`)
  }

  await scanFolderRecursive(folderPath, audioFiles)
  return audioFiles
}

/**
 * Internal recursive function to scan folders
 */
async function scanFolderRecursive(currentPath: string, audioFiles: string[]): Promise<void> {
  try {
    const entries = await fs.readdir(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name)

      // Skip hidden files and folders (starting with .)
      if (entry.name.startsWith('.')) {
        continue
      }

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        try {
          await scanFolderRecursive(fullPath, audioFiles)
        } catch {
          // Skip directories we can't access
          console.warn(`Skipping inaccessible directory: ${fullPath}`)
        }
      } else if (entry.isFile()) {
        // Check if it's a supported audio file
        if (isSupportedAudioFile(fullPath)) {
          audioFiles.push(fullPath)
        }
        // Skip unsupported files silently (Requirements 1.5)
      }
    }
  } catch (error) {
    console.warn(`Error scanning directory ${currentPath}:`, error)
    throw error
  }
}

// Store active watchers for cleanup
const activeWatchers = new Map<string, FSWatcher>()

/**
 * Watches a folder for file changes
 * @param folderPath - The path to watch
 * @param callback - Callback function for file change events
 */
export function watchFolder(folderPath: string, callback: (event: FileChangeEvent) => void): void {
  // Stop existing watcher if any
  unwatchFolder(folderPath)

  try {
    const watcher = watch(folderPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return

      const fullPath = join(folderPath, filename)

      // Only process audio files
      if (!isSupportedAudioFile(fullPath)) return

      let changeType: FileChangeEvent['type']
      if (eventType === 'rename') {
        // 'rename' can mean added or removed - we need to check if file exists
        pathExists(fullPath).then((exists) => {
          changeType = exists ? 'added' : 'removed'
          callback({ type: changeType, filePath: fullPath })
        })
      } else if (eventType === 'change') {
        callback({ type: 'modified', filePath: fullPath })
      }
    })

    activeWatchers.set(folderPath, watcher)
  } catch (error) {
    console.error(`Failed to watch folder ${folderPath}:`, error)
    throw error
  }
}

/**
 * Stops watching a folder
 * @param folderPath - The path to stop watching
 */
export function unwatchFolder(folderPath: string): void {
  const watcher = activeWatchers.get(folderPath)
  if (watcher) {
    watcher.close()
    activeWatchers.delete(folderPath)
  }
}

/**
 * Stops all active folder watchers
 */
export function unwatchAllFolders(): void {
  for (const [path, watcher] of activeWatchers) {
    watcher.close()
    activeWatchers.delete(path)
  }
}

/**
 * Gets the folder name from a path
 */
export function getFolderName(folderPath: string): string {
  return basename(folderPath)
}

// Export the FileService interface for type safety
export interface FileService {
  scanFolder: typeof scanFolder
  pathExists: typeof pathExists
  watchFolder: typeof watchFolder
  unwatchFolder: typeof unwatchFolder
  isSupportedAudioFile: typeof isSupportedAudioFile
}

export const fileService: FileService = {
  scanFolder,
  pathExists,
  watchFolder,
  unwatchFolder,
  isSupportedAudioFile
}
