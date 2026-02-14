import * as React from 'react'
import { createPortal } from 'react-dom'
import { useNeteaseStore, neteaseTrackToPlayerTrack } from '@renderer/stores/netease-store'
import { usePlayerStore } from '@renderer/stores/player-store'
import { toast } from '@renderer/components/feedback'
import { ConfirmDialog } from '@renderer/components/feedback/ConfirmDialog'
import type { NeteaseTrack, NeteasePlaylist } from '@shared/types/netease'

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function RefreshIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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

interface ImportPlaylistDialogProps {
  isOpen: boolean
  onClose: () => void
  authCookie: string
  onOpenCookieDialog: () => void
}

function ImportPlaylistDialog({
  isOpen,
  onClose,
  authCookie,
  onOpenCookieDialog
}: ImportPlaylistDialogProps): React.JSX.Element | null {
  const [input, setInput] = React.useState('')
  const { importPlaylist, isLoading, error, clearError } = useNeteaseStore()
  const hasCookie = Boolean(authCookie)

  React.useEffect(() => {
    if (!isOpen) return
    setInput('')
    clearError()
  }, [isOpen, clearError])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!hasCookie) {
      toast.warning('请先设置网易云 Cookie 后再导入歌单')
      onOpenCookieDialog()
      onClose()
      return
    }

    try {
      const playlist = await importPlaylist(input.trim())
      toast.success(`已导入歌单：${playlist.name}`)
      onClose()
    } catch (error) {
      const msg = error instanceof Error ? error.message : '导入歌单失败'
      toast.error(msg)
    }
  }

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          导入网易云歌单
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) clearError()
            }}
            placeholder="输入网易云歌单链接或ID"
            className="glass-soft focus-ring w-full rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100"
            disabled={isLoading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!hasCookie && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
              <p>尚未设置 Cookie，导入歌单前请先设置</p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenCookieDialog()
                }}
                className="mt-1 text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                前往设置 →
              </button>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="interactive-soft rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !hasCookie}
              className="interactive-soft focus-ring rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '导入中...' : '导入歌单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

interface CookieSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

function CookieSettingsDialog({
  isOpen,
  onClose
}: CookieSettingsDialogProps): React.JSX.Element | null {
  const { authCookie, setAuthCookie, clearAuthCookie, refreshLoginStatus, loginStatus } =
    useNeteaseStore()
  const [cookie, setCookie] = React.useState(authCookie)
  const [saving, setSaving] = React.useState(false)
  const [checking, setChecking] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return
    setCookie(authCookie)
  }, [authCookie, isOpen])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = async (): Promise<void> => {
    if (!cookie.trim() || saving) return
    setSaving(true)
    try {
      const status = await setAuthCookie(cookie.trim())
      if (status.nickname) {
        toast.success(`已登录: ${status.nickname}${status.isVip ? ' (VIP)' : ''}`)
      } else {
        toast.success('Cookie 已保存')
      }
      onClose()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Cookie 无效，请检查后重试'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCheckStatus = async (): Promise<void> => {
    if (checking) return
    setChecking(true)
    try {
      const status = await refreshLoginStatus()
      if (!status || !status.isLoggedIn) {
        toast.warning('Cookie 可能已过期，请重新复制新的 MUSIC_U')
      } else {
        toast.success(`Cookie 有效: ${status.nickname ?? '已登录'}${status.isVip ? ' (VIP)' : ''}`)
      }
    } catch {
      toast.error('检测失败，请稍后重试')
    } finally {
      setChecking(false)
    }
  }

  const handleClearCookie = async (): Promise<void> => {
    if (saving || checking) return
    setSaving(true)
    try {
      await clearAuthCookie()
      setCookie('')
      toast.success('Cookie 已清空')
    } catch {
      toast.error('清空失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-3xl rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          设置网易云 Cookie
        </h3>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          当前账号:{' '}
          {loginStatus?.isLoggedIn
            ? `${loginStatus.nickname ?? '已登录'}${loginStatus.isVip ? ' (VIP)' : ''}`
            : '未登录'}
        </p>
        <div className="space-y-3">
          <input
            autoFocus
            type="password"
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            placeholder="输入 MUSIC_U Cookie（可选，用于VIP歌曲）"
            className="glass-soft focus-ring w-full rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100"
            disabled={saving}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void handleCheckStatus()
                }}
                disabled={saving || checking}
                className="interactive-soft rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {checking ? '检测中...' : '检测状态'}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleClearCookie()
                }}
                disabled={saving || checking || !authCookie}
                className="interactive-soft rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                清空
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="interactive-soft rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSave()
                }}
                disabled={saving || !cookie.trim()}
                className="interactive-soft focus-ring rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {saving ? '保存中...' : '保存Cookie'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

interface RenamePlaylistDialogProps {
  playlist: NeteasePlaylist | null
  value: string
  onChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

function RenamePlaylistDialog({
  playlist,
  value,
  onChange,
  onCancel,
  onConfirm
}: RenamePlaylistDialogProps): React.JSX.Element | null {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!playlist || !inputRef.current) return
    inputRef.current.focus()
    inputRef.current.select()
  }, [playlist])

  if (!playlist) return null

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="glass-panel w-full max-w-md rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">重命名歌单</h3>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm()
            if (e.key === 'Escape') onCancel()
          }}
          className="glass-soft focus-ring mb-4 w-full rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100"
          placeholder="输入歌单名称"
          maxLength={60}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="interactive-soft rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={!value.trim()}
            className="interactive-soft focus-ring rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

interface PlaylistCardProps {
  playlist: NeteasePlaylist
  isActive: boolean
  onClick: () => void
  onRefresh: () => void
  onDelete: () => void
  onRename: () => void
  onDropOn: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
  isBusy: boolean
}

function PlaylistCard({
  playlist,
  isActive,
  onClick,
  onRefresh,
  onDelete,
  onRename,
  onDropOn,
  onDragStart,
  onDragEnd,
  isDragging,
  isBusy
}: PlaylistCardProps): React.JSX.Element {
  return (
    <div
      draggable={!isBusy}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDropOn()
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${
        isDragging
          ? 'border-orange-300 bg-orange-50/60 opacity-50 dark:border-orange-800/60 dark:bg-orange-900/20'
          : isActive
            ? 'border-orange-300 bg-orange-100/80 dark:border-orange-800/60 dark:bg-orange-900/30'
            : 'border-transparent hover:border-zinc-200 hover:bg-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
      }`}
    >
      <button
        onClick={onClick}
        className="flex min-w-0 w-full items-center gap-3 text-left"
        disabled={isBusy}
        title={playlist.name}
      >
        <img
          src={playlist.coverUrl + '?param=80y80'}
          alt={playlist.name}
          className="h-11 w-11 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {playlist.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {playlist.trackCount} 首歌曲
          </p>
        </div>
      </button>

      <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-zinc-200/70 pt-2 dark:border-zinc-700/70">
        <button
          onClick={onRename}
          disabled={isBusy}
          className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          title="重命名歌单"
        >
          <EditIcon />
        </button>
        <button
          onClick={onRefresh}
          disabled={isBusy}
          className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          title="刷新歌单"
        >
          <RefreshIcon />
        </button>
        <button
          onClick={onDelete}
          disabled={isBusy}
          className="rounded-md p-1.5 text-zinc-500 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="删除歌单"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  )
}

interface TrackRowProps {
  track: NeteaseTrack
  index: number
  isPlaying: boolean
  onPlay: () => void
}

function TrackRow({ track, index, isPlaying, onPlay }: TrackRowProps): React.JSX.Element {
  return (
    <button
      onClick={onPlay}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        isPlaying
          ? 'bg-orange-100 dark:bg-orange-900/30'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="w-8 text-center text-sm text-zinc-400">{index + 1}</span>
      <img
        src={track.album.picUrl + '?param=40y40'}
        alt={track.album.name}
        className="h-10 w-10 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${isPlaying ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-zinc-100'}`}
        >
          {track.name}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
      </div>
      <span className="text-sm text-zinc-400">{formatDuration(track.duration)}</span>
    </button>
  )
}

export function NeteaseView(): React.JSX.Element {
  const {
    playlists,
    currentPlaylist,
    isLoading,
    setCurrentPlaylist,
    removePlaylist,
    refreshPlaylist,
    renamePlaylist,
    reorderPlaylists,
    getSongPlayUrl,
    prefetchSongUrls,
    songUrlCache,
    authCookie,
    syncAuthCookie,
    refreshLoginStatus,
    loginStatus
  } = useNeteaseStore()
  const { currentTrack, isPlaying } = usePlayerStore()
  const setQueue = usePlayerStore((s) => s.setQueue)
  const hasShownExpiredPromptRef = React.useRef(false)
  const [draggingPlaylistId, setDraggingPlaylistId] = React.useState<number | null>(null)
  const [renamingPlaylist, setRenamingPlaylist] = React.useState<NeteasePlaylist | null>(null)
  const [renameValue, setRenameValue] = React.useState('')
  const [deletingPlaylist, setDeletingPlaylist] = React.useState<NeteasePlaylist | null>(null)
  const [cookieDialogOpen, setCookieDialogOpen] = React.useState(false)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [trackKeyword, setTrackKeyword] = React.useState('')

  React.useEffect(() => {
    void syncAuthCookie().then(async () => {
      const status = await refreshLoginStatus()
      if (authCookie && status && !status.isLoggedIn && !hasShownExpiredPromptRef.current) {
        hasShownExpiredPromptRef.current = true
        toast.warning('检测到 Cookie 可能已过期，请重新粘贴 MUSIC_U')
      }
    })
  }, [authCookie, syncAuthCookie, refreshLoginStatus])

  const visibleTracks = React.useMemo(() => {
    if (!currentPlaylist) return []
    const keyword = trackKeyword.trim().toLowerCase()
    if (!keyword) return currentPlaylist.tracks

    return currentPlaylist.tracks.filter((track) => {
      const artistNames = track.artists.map((a) => a.name).join(' ')
      return (
        track.name.toLowerCase().includes(keyword) ||
        artistNames.toLowerCase().includes(keyword) ||
        track.album.name.toLowerCase().includes(keyword)
      )
    })
  }, [currentPlaylist, trackKeyword])

  const playFromIndex = async (startIndex: number, allTracks: NeteaseTrack[]): Promise<boolean> => {
    for (let index = startIndex; index < allTracks.length; index++) {
      const track = allTracks[index]
      const url = await getSongPlayUrl(track.id)
      if (!url) continue

      const nextTracks = allTracks.slice(index + 1, index + 6)
      if (nextTracks.length > 0) {
        void prefetchSongUrls(nextTracks.map((t) => t.id))
      }

      const queueTracks = allTracks.map((t) => {
        const pt = neteaseTrackToPlayerTrack(t)
        const cachedUrl = songUrlCache.get(t.id)?.url
        return {
          id: pt.id,
          filePath: t.id === track.id ? url : (cachedUrl ?? ''),
          title: pt.title,
          artist: pt.artist,
          album: pt.album,
          duration: pt.duration,
          coverUrl: pt.coverUrl,
          format: 'mp3',
          addedAt: Date.now(),
          folderId: 'netease'
        }
      })

      await setQueue(queueTracks, index)

      if (index > startIndex) {
        toast.warning(`已自动跳过 ${index - startIndex} 首不可播放歌曲`)
      }

      return true
    }

    return false
  }

  const handlePlayTrack = async (track: NeteaseTrack, allTracks: NeteaseTrack[]): Promise<void> => {
    const startIndex = allTracks.findIndex((t) => t.id === track.id)
    if (startIndex < 0) return

    const success = await playFromIndex(startIndex, allTracks)
    if (success) return

    if (authCookie) {
      const latestStatus = await refreshLoginStatus()
      if (latestStatus && !latestStatus.isLoggedIn) {
        toast.warning(`无法播放「${track.name}」- Cookie 可能已过期，请重新粘贴 MUSIC_U`)
        return
      }
    }

    const tip = loginStatus?.isLoggedIn
      ? '当前列表后续歌曲均不可播放（可能需要更高会员或有版权限制）'
      : '该歌曲可能需要VIP，建议先设置 MUSIC_U Cookie'
    toast.error(`无法播放「${track.name}」- ${tip}`)
  }

  const handlePlayAll = async (): Promise<void> => {
    if (visibleTracks.length === 0) return
    await handlePlayTrack(visibleTracks[0], visibleTracks)
  }

  const confirmRenamePlaylist = (): void => {
    if (!renamingPlaylist) return

    const trimmed = renameValue.trim()
    if (!trimmed) return
    if (trimmed === renamingPlaylist.name) {
      setRenamingPlaylist(null)
      setRenameValue('')
      return
    }

    const exists = playlists.some(
      (p) => p.id !== renamingPlaylist.id && p.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) {
      toast.error('已存在同名歌单')
      return
    }

    renamePlaylist(renamingPlaylist.id, trimmed)
    toast.success(`已重命名为：${trimmed}`)
    setRenamingPlaylist(null)
    setRenameValue('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">网易云音乐</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              当前账号:{' '}
              {loginStatus?.isLoggedIn
                ? `${loginStatus.nickname ?? '已登录'}${loginStatus.isVip ? ' (VIP)' : ''}`
                : '未登录'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCookieDialogOpen(true)}
              className="interactive-soft focus-ring rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              设置Cookie
            </button>
            <button
              onClick={() => setImportDialogOpen(true)}
              className="interactive-soft focus-ring rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              导入歌单
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="h-full w-72 flex-shrink-0 overflow-y-auto border-r border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            已导入的歌单
          </h2>
          {playlists.length === 0 ? (
            <p className="text-sm text-zinc-400">暂无歌单</p>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  isActive={currentPlaylist?.id === playlist.id}
                  isDragging={draggingPlaylistId === playlist.id}
                  isBusy={isLoading}
                  onClick={() => setCurrentPlaylist(playlist)}
                  onDragStart={() => {
                    setDraggingPlaylistId(playlist.id)
                  }}
                  onDragEnd={() => {
                    setDraggingPlaylistId(null)
                  }}
                  onDropOn={() => {
                    if (draggingPlaylistId === null || draggingPlaylistId === playlist.id) return
                    reorderPlaylists(draggingPlaylistId, playlist.id)
                    setDraggingPlaylistId(null)
                  }}
                  onRename={() => {
                    setRenamingPlaylist(playlist)
                    setRenameValue(playlist.name)
                  }}
                  onRefresh={() => {
                    void refreshPlaylist(playlist.id)
                      .then(() => {
                        toast.success(`已刷新歌单：${playlist.name}`)
                      })
                      .catch((error) => {
                        const msg = error instanceof Error ? error.message : '刷新歌单失败'
                        toast.error(msg)
                      })
                  }}
                  onDelete={() => {
                    setDeletingPlaylist(playlist)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-full flex-1 overflow-y-auto p-4">
          {currentPlaylist ? (
            <>
              <div className="mb-4 flex items-center gap-4">
                <img
                  src={currentPlaylist.coverUrl + '?param=160y160'}
                  alt={currentPlaylist.name}
                  className="h-24 w-24 rounded-xl object-cover shadow-lg"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {currentPlaylist.name}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {currentPlaylist.trackCount} 首歌曲 · 播放 {currentPlaylist.playCount} 次
                  </p>
                  <button
                    onClick={handlePlayAll}
                    className="mt-2 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    播放全部
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  value={trackKeyword}
                  onChange={(e) => setTrackKeyword(e.target.value)}
                  placeholder="在当前歌单搜索歌曲/歌手/专辑"
                  className="glass-soft focus-ring w-full rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                {visibleTracks.length > 0 ? (
                  visibleTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={isPlaying && currentTrack?.id === `netease-${track.id}`}
                      onPlay={() => handlePlayTrack(track, visibleTracks)}
                    />
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    未找到匹配歌曲
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              选择一个歌单开始播放
            </div>
          )}
        </div>
      </div>

      <RenamePlaylistDialog
        playlist={renamingPlaylist}
        value={renameValue}
        onChange={setRenameValue}
        onCancel={() => {
          setRenamingPlaylist(null)
          setRenameValue('')
        }}
        onConfirm={confirmRenamePlaylist}
      />

      <CookieSettingsDialog
        isOpen={cookieDialogOpen}
        onClose={() => {
          setCookieDialogOpen(false)
        }}
      />

      <ImportPlaylistDialog
        isOpen={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false)
        }}
        authCookie={authCookie}
        onOpenCookieDialog={() => setCookieDialogOpen(true)}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingPlaylist)}
        title="删除歌单"
        message={
          deletingPlaylist
            ? `确定删除歌单「${deletingPlaylist.name}」吗？该操作不会删除网易云原歌单。`
            : ''
        }
        confirmLabel="删除"
        cancelLabel="取消"
        variant="danger"
        onConfirm={() => {
          if (!deletingPlaylist) return
          removePlaylist(deletingPlaylist.id)
          toast.info(`已删除歌单：${deletingPlaylist.name}`)
          setDeletingPlaylist(null)
        }}
        onCancel={() => {
          setDeletingPlaylist(null)
        }}
      />
    </div>
  )
}
