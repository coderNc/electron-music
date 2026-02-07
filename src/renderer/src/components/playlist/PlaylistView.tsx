import * as React from 'react'
import { createPortal } from 'react-dom'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { useUIStore } from '@renderer/stores/ui-store'
import type { Playlist } from '@shared/types'

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

function PlaylistItem({
  playlist,
  onSelect,
  onDelete,
  onRename
}: PlaylistItemProps): React.JSX.Element {
  const trackCount = playlist.trackIds.length

  return (
    <div
      className="surface-card interactive-soft group flex cursor-pointer items-center justify-between rounded-2xl border p-4"
      onClick={() => onSelect(playlist.id)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">
          <PlaylistIcon />
        </div>
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{playlist.name}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{trackCount} 首歌曲</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRename(playlist.id)
          }}
          className="interactive-soft focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          title="重命名播放列表"
        >
          <EditIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(playlist.id)
          }}
          className="interactive-soft focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200/60 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-red-400"
          title="删除播放列表"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onCreatePlaylist }: { onCreatePlaylist: () => void }): React.JSX.Element {
  return (
    <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-16 text-center stage-gradient">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <svg
          className="h-8 w-8 text-zinc-500 dark:text-zinc-400"
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
      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">没有播放列表</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-600 dark:text-zinc-300">
        创建播放列表来整理你喜欢的音乐
      </p>
      <button
        onClick={onCreatePlaylist}
        className="interactive-soft focus-ring rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 font-medium text-white shadow-lg shadow-orange-500/20"
      >
        <span className="inline-flex items-center gap-2">
          <AddPlaylistIcon />
          创建播放列表
        </span>
      </button>
    </div>
  )
}

export interface PlaylistViewProps {
  onSelectPlaylist?: (playlistId: string) => void
}

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

  React.useEffect(() => {
    if (renamingPlaylistId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingPlaylistId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">播放列表</h2>
        <button
          onClick={openCreatePlaylistDialog}
          className="interactive-soft focus-ring rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/20"
        >
          <span className="inline-flex items-center gap-2">
            <AddPlaylistIcon />
            创建播放列表
          </span>
        </button>
      </div>

      {error && (
        <div className="surface-card flex items-center justify-between rounded-xl border border-red-200/70 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="focus-ring rounded px-2 text-sm text-red-700 underline dark:text-red-400"
          >
            关闭
          </button>
        </div>
      )}

      {renamingPlaylistId &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setRenamingPlaylistId(null)
              setRenameValue('')
            }}
          >
            <div
              className="glass-panel w-full max-w-md rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                重命名播放列表
              </h3>
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renamingPlaylistId && renameValue.trim()) {
                    renamePlaylist(renamingPlaylistId, renameValue.trim())
                    setRenamingPlaylistId(null)
                    setRenameValue('')
                  }
                  if (e.key === 'Escape') {
                    setRenamingPlaylistId(null)
                    setRenameValue('')
                  }
                }}
                className="glass-soft focus-ring mb-4 w-full rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100"
                placeholder="播放列表名称"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setRenamingPlaylistId(null)
                    setRenameValue('')
                  }}
                  className="interactive-soft rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (renamingPlaylistId && renameValue.trim()) {
                      await renamePlaylist(renamingPlaylistId, renameValue.trim())
                    }
                    setRenamingPlaylistId(null)
                    setRenameValue('')
                  }}
                  disabled={!renameValue.trim()}
                  className="interactive-soft focus-ring rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {playlists.length === 0 ? (
        <EmptyState onCreatePlaylist={openCreatePlaylistDialog} />
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            所有播放列表 ({playlists.length})
          </h3>
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                onSelect={(playlistId) => {
                  setCurrentPlaylist(playlistId)
                  onSelectPlaylist?.(playlistId)
                }}
                onDelete={(playlistId) => {
                  if (window.confirm('确定要删除这个播放列表吗？')) deletePlaylist(playlistId)
                }}
                onRename={(playlistId) => {
                  const p = playlists.find((item) => item.id === playlistId)
                  if (!p) return
                  setRenamingPlaylistId(playlistId)
                  setRenameValue(p.name)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
