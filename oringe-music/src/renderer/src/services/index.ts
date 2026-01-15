// Renderer process services exports

export {
  ipcService,
  selectFolder,
  scanFolder,
  pathExists,
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
  onScanProgress,
  IPCServiceError
} from './ipc-service'

export type { IPCService } from './ipc-service'

export {
  audioService,
  load,
  play,
  pause,
  stop,
  seek,
  getPosition,
  setVolume,
  getVolume,
  getDuration,
  isPlaying,
  getStatus,
  getCurrentFilePath,
  onEnd,
  onError,
  onProgress,
  onStatusChange,
  onLoad,
  dispose,
  clearAllListeners,
  AudioServiceError
} from './audio-service'

export type {
  AudioService,
  PlaybackStatus,
  EndCallback,
  ErrorCallback,
  ProgressCallback,
  StatusChangeCallback,
  LoadCallback
} from './audio-service'
