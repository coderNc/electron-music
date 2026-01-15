// Export all stores
export { usePlayerStore } from './player-store'
export type { PlayerStore, PlayerState, PlayerActions, PlaybackMode } from './player-store'
export {
  selectCurrentTrack,
  selectIsPlaying,
  selectPosition,
  selectDuration,
  selectVolume,
  selectPlaybackMode,
  selectQueue,
  selectQueueIndex,
  selectIsLoading as selectPlayerIsLoading,
  selectError as selectPlayerError
} from './player-store'

export { useLibraryStore } from './library-store'
export type { LibraryStore, LibraryState, LibraryActions } from './library-store'
export {
  selectFolders,
  selectTracks,
  selectIsScanning,
  selectScanProgress,
  selectSearchQuery,
  selectError as selectLibraryError
} from './library-store'

export { usePlaylistStore } from './playlist-store'
export type { PlaylistStore, PlaylistState, PlaylistActions } from './playlist-store'
export {
  selectPlaylists,
  selectCurrentPlaylistId,
  selectIsLoading as selectPlaylistIsLoading,
  selectError as selectPlaylistError
} from './playlist-store'

export { useUIStore } from './ui-store'
export type { UIStore, UIState, UIActions, ViewType, ThemeType } from './ui-store'
export {
  selectCurrentView,
  selectSidebarCollapsed,
  selectQueueVisible,
  selectTheme,
  selectCreatePlaylistDialogOpen,
  selectAddFolderDialogOpen,
  selectContextMenuPosition,
  selectContextMenuData
} from './ui-store'

export { useToastStore, toast } from './toast-store'
export type { Toast, ToastType } from './toast-store'
