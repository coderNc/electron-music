import * as React from 'react'
import { AppLayout, LoadingScreen } from '@renderer/components/layout'
import { LibraryView, AlbumGrid, ArtistList, SearchBar } from '@renderer/components/library'
import { PlaylistView, PlaylistDetail, CreatePlaylistDialog } from '@renderer/components/playlist'
import { NeteaseView } from '@renderer/components/netease'
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

  const handleSelectPlaylist = (playlistId: string): void => {
    setCurrentPlaylist(playlistId)
  }

  const renderContent = (): React.JSX.Element | null => {
    switch (currentView) {
      case 'library':
        return <LibraryView />
      case 'playlists':
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
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">专辑</h2>
              <SearchBar className="w-64" inputRef={searchInputRef ?? undefined} />
            </div>
            <AlbumGrid />
          </div>
        )
      case 'artists':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">艺术家</h2>
              <SearchBar className="w-64" inputRef={searchInputRef ?? undefined} />
            </div>
            <ArtistList />
          </div>
        )
      case 'queue':
        return (
          <div className="glass-panel space-y-3 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">播放队列</h2>
            <p className="text-zinc-600 dark:text-zinc-300">
              队列已集成在右侧面板中，可通过侧边栏"播放队列"打开。
            </p>
          </div>
        )
      case 'netease':
        return <NeteaseView />
      default:
        return null
    }
  }

  return <>{renderContent()}</>
}

function App(): React.JSX.Element {
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const { isLoading, error, progress } = useAppInitialization()

  useAppStateSync()
  useKeyboardShortcuts({ searchInputRef })
  useErrorNotifications()
  useTheme()

  if (isLoading) {
    return <LoadingScreen message={progress.message} error={error} />
  }

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
