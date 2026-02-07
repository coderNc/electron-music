import * as React from 'react'
import { createPortal } from 'react-dom'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { useUIStore } from '@renderer/stores/ui-store'

function CloseIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PlaylistIcon(): React.JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  )
}

export interface CreatePlaylistDialogProps {
  isOpen?: boolean
  onClose?: () => void
  onCreated?: (playlistId: string) => void
}

export function CreatePlaylistDialog({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  onCreated
}: CreatePlaylistDialogProps): React.JSX.Element | null {
  const dialogOpenFromStore = useUIStore((state) => state.createPlaylistDialogOpen)
  const closeDialogFromStore = useUIStore((state) => state.closeCreatePlaylistDialog)

  const isOpen = isOpenProp ?? dialogOpenFromStore
  const onClose = onCloseProp ?? closeDialogFromStore

  const createPlaylist = usePlaylistStore((state) => state.createPlaylist)
  const playlists = usePlaylistStore((state) => state.playlists)
  const error = usePlaylistStore((state) => state.error)
  const clearError = usePlaylistStore((state) => state.clearError)

  const [name, setName] = React.useState('')
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isOpen || !inputRef.current) return
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return
    setName('')
    setLocalError(null)
    clearError()
  }, [isOpen, clearError])

  const validateName = (value: string): string | null => {
    const trimmed = value.trim()
    if (!trimmed) return '请输入播放列表名称'
    if (trimmed.length > 100) return '播放列表名称不能超过 100 个字符'
    const exists = playlists.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) return '已存在同名的播放列表'
    return null
  }

  if (!isOpen) return null

  const displayError = localError || error

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isSubmitting) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
    >
      <div className="glass-panel w-full max-w-md rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-200/70 px-6 py-4 dark:border-zinc-700/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <PlaylistIcon />
            </div>
            <h2
              id="create-playlist-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              创建播放列表
            </h2>
          </div>
          <button
            onClick={() => {
              if (!isSubmitting) onClose()
            }}
            disabled={isSubmitting}
            className="interactive-soft focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const validationError = validateName(name)
            if (validationError) {
              setLocalError(validationError)
              return
            }

            setIsSubmitting(true)
            setLocalError(null)

            try {
              await createPlaylist(name.trim())
              const newPlaylist = usePlaylistStore
                .getState()
                .playlists.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())

              if (onCreated && newPlaylist) onCreated(newPlaylist.id)
              onClose()
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : '创建播放列表失败')
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="p-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="playlist-name"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                播放列表名称
              </label>
              <input
                ref={inputRef}
                id="playlist-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (localError) setLocalError(null)
                }}
                disabled={isSubmitting}
                className={`glass-soft focus-ring w-full rounded-xl px-4 py-3 text-zinc-900 placeholder-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-100 dark:placeholder-zinc-500 ${
                  displayError ? 'border-red-500' : ''
                }`}
                placeholder="输入播放列表名称"
                maxLength={100}
                autoComplete="off"
              />
              {displayError && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">{displayError}</p>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              创建后，你可以从音乐库中添加歌曲到这个播放列表
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose()
              }}
              disabled={isSubmitting}
              className="interactive-soft rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="interactive-soft focus-ring rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
