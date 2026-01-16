import * as React from 'react'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { useUIStore } from '@renderer/stores/ui-store'
import type { Playlist } from '@shared/types'

/**
 * Playlist icon
 */
function PlaylistIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  )
}

/**
 * Add playlist icon
 */
function AddPlaylistIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  )
}

/**
 * Delete icon
 */
function DeleteIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

/**
 * Edit icon
 */
function EditIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  )
}

interface PlaylistItemProps {
  playlist: Playlist
  onSelect: (playlistId: string) => void
  onDelete: (playlistId: string) => void
  onRename: (playlistId: string) => void
}

/**
 * Individual playlist item in the list
 */
function PlaylistItem({
  playlist,
  onSelect,
  onDelete,
  onRename
}: PlaylistItemProps): React.JSX.Element {
  const trackCount = playlist.trackIds.length

  return (
    <div
      className="group flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
      onClick={() => onSelect(playlist.id)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white">
          <PlaylistIcon />
        </div>
        <div>
          <h3 className="font-medium text-zinc-100">{playlist.name}</h3>
          <p className="text-sm text-zinc-500">{trackCount} 首歌曲</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRename(playlist.id)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          title="重命名播放列表"
        >
          <EditIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(playlist.id)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
          title="删除播放列表"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  )
}

/**
 * Empty state when no playlists exist
 */
function EmptyState({ onCreatePlaylist }: { onCreatePlaylist: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
        <svg
          className="h-8 w-8 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-100">没有播放列表</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-400">创建播放列表来整理你喜欢的音乐</p>
      <button
        onClick={onCreatePlaylist}
        className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
      >
        <AddPlaylistIcon />
        创建播放列表
      </button>
    </div>
  )
}

export interface PlaylistViewProps {
  /** Callback when a playlist is selected */
  onSelectPlaylist?: (playlistId: string) => void
}

/**
 * PlaylistView component
 *
 * Main view for displaying all playlists with create, rename, and delete functionality.
 *
 * Requirements: 4.1
 */
export function PlaylistView({ onSelectPlaylist }: PlaylistViewProps): React.JSX.Element {
  const playlists = usePlaylistStore((state) => state.playlists)
  const error = usePlaylistStore((state) => state.error)
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist)
  const renamePlaylist = usePlaylistStore((state) => state.renamePlaylist)
  const clearError = usePlaylistStore((state) => state.clearError)
  const setCurrentPlaylist = usePlaylistStore((state) => state.setCurrentPlaylist)
  const openCreatePlaylistDialog = useUIStore((state) => state.openCreatePlaylistDialog)

  const [renamingPlaylistId, setRenamingPlaylistId] = React.useState<string | null>(null)
  const [renameValue, setRenameValue] = React.useState('')
  const renameInputRef = React.useRef<HTMLInputElement>(null)

  const handleCreatePlaylist = (): void => {
    openCreatePlaylistDialog()
  }

  const handleSelectPlaylist = (playlistId: string): void => {
    setCurrentPlaylist(playlistId)
    if (onSelectPlaylist) {
      onSelectPlaylist(playlistId)
    }
  }

  const handleDeletePlaylist = (playlistId: string): void => {
    if (window.confirm('确定要删除这个播放列表吗？')) {
      deletePlaylist(playlistId)
    }
  }

  const handleStartRename = (playlistId: string): void => {
    const playlist = playlists.find((p) => p.id === playlistId)
    if (playlist) {
      setRenamingPlaylistId(playlistId)
      setRenameValue(playlist.name)
    }
  }

  const handleRenameSubmit = async (): Promise<void> => {
    if (renamingPlaylistId && renameValue.trim()) {
      await renamePlaylist(renamingPlaylistId, renameValue.trim())
    }
    setRenamingPlaylistId(null)
    setRenameValue('')
  }

  const handleRenameCancel = (): void => {
    setRenamingPlaylistId(null)
    setRenameValue('')
  }

  // Focus rename input when it appears
  React.useEffect(() => {
    if (renamingPlaylistId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingPlaylistId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-100">播放列表</h2>
        <button
          onClick={handleCreatePlaylist}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
        >
          <AddPlaylistIcon />
          创建播放列表
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-900/50 bg-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="text-sm text-red-400 underline hover:text-red-300"
          >
            关闭
          </button>
        </div>
      )}

      {/* Rename dialog */}
      {renamingPlaylistId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-medium text-zinc-100">重命名播放列表</h3>
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit()
                if (e.key === 'Escape') handleRenameCancel()
              }}
              className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              placeholder="播放列表名称"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleRenameCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              >
                取消
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={!renameValue.trim()}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist list or empty state */}
      {playlists.length === 0 ? (
        <EmptyState onCreatePlaylist={handleCreatePlaylist} />
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">所有播放列表 ({playlists.length})</h3>
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                onSelect={handleSelectPlaylist}
                onDelete={handleDeletePlaylist}
                onRename={handleStartRename}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
