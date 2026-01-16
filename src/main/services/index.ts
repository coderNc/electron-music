// Main process services exports

export {
  fileService,
  scanFolder,
  pathExists,
  watchFolder,
  unwatchFolder,
  unwatchAllFolders,
  isSupportedAudioFile,
  isDirectory,
  hasReadPermission,
  getFolderName
} from './file-service'

export type { FileService } from './file-service'

export {
  metadataService,
  parseAudioFile,
  parseAudioFiles,
  extractCover,
  generateTrackId,
  getFileFormat,
  getTitleFromFilename,
  coverToBase64
} from './metadata-service'

export type { MetadataService } from './metadata-service'

export {
  persistenceService,
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

export type { PersistenceService } from './persistence-service'
