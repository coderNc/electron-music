import * as React from 'react'
import { AppLayout, LoadingScreen } from '@renderer/components/layout'
import { LibraryView, AlbumGrid, ArtistList, SearchBar } from '@renderer/components/library'
import { PlaylistView, PlaylistDetail, CreatePlaylistDialog } from '@renderer/components/playlist'
import { ErrorBoundary, ToastContainer } from '@renderer/components/feedback'
import { useUIStore } from '@renderer/stores/ui-store'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import {
  useKeyboardShortcuts,
  useAppInitialization,
  useAppStateSync,
  useErrorNotifications,
  useTheme
} from '@renderer/hooks'
import { SearchInputRefContext, useSearchInputRef } from '@renderer/contexts'

function MainContent(): React.JSX.Element {
  const currentView = useUIStore((state) => state.currentView)
  const currentPlaylistId = usePlaylistStore((state) => state.currentPlaylistId)
  const setCurrentPlaylist = usePlaylistStore((state) => state.setCurrentPlaylist)
  const searchInputRef = useSearchInputRef()

  // Handle playlist selection - show detail view
  const handleSelectPlaylist = (playlistId: string): void => {
    setCurrentPlaylist(playlistId)
  }

  // Placeholder content for each view - will be implemented in later tasks
  const renderContent = (): React.JSX.Element | null => {
    switch (currentView) {
      case 'library':
        return <LibraryView />
      case 'playlists':
        // If a playlist is selected, show detail view
        if (currentPlaylistId) {
          const playlist = usePlaylistStore.getState().getPlaylistById(currentPlaylistId)
          if (playlist) {
            return <PlaylistDetail playlist={playlist} onBack={() => setCurrentPlaylist(null)} />
          }
        }
        return <PlaylistView onSelectPlaylist={handleSelectPlaylist} />
      case 'albums':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-zinc-100">专辑</h2>
              <SearchBar className="w-64" inputRef={searchInputRef ?? undefined} />
            </div>
            <AlbumGrid />
          </div>
        )
      case 'artists':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-zinc-100">艺术家</h2>
              <SearchBar className="w-64" inputRef={searchInputRef ?? undefined} />
            </div>
            <ArtistList />
          </div>
        )
      case 'queue':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">播放队列</h2>
            <p className="text-zinc-400">播放队列视图将在任务 11 中实现</p>
          </div>
        )
      default:
        return null
    }
  }

  return <>{renderContent()}</>
}

function App(): React.JSX.Element {
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Initialize app and load data
  const { isLoading, error, progress } = useAppInitialization()

  // Set up state sync (save state periodically and on close)
  useAppStateSync()

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({ searchInputRef })

  // Set up error notifications from stores
  useErrorNotifications()

  // Initialize theme system
  useTheme()

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen message={progress.message} error={error} />
  }

  // Show error screen if initialization failed
  if (error) {
    return <LoadingScreen error={error} />
  }

  return (
    <ErrorBoundary>
      <SearchInputRefContext.Provider value={searchInputRef}>
        <AppLayout>
          <MainContent />
          <CreatePlaylistDialog />
        </AppLayout>
        <ToastContainer />
      </SearchInputRefContext.Provider>
    </ErrorBoundary>
  )
}

export default App
