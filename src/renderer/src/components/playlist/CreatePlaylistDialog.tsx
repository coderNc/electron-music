import * as React from 'react'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { useUIStore } from '@renderer/stores/ui-store'

/**
 * Close icon
 */
function CloseIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/**
 * Playlist icon
 */
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
  /** Whether the dialog is open */
  isOpen?: boolean
  /** Callback when dialog is closed */
  onClose?: () => void
  /** Callback when playlist is created successfully */
  onCreated?: (playlistId: string) => void
}

/**
 * CreatePlaylistDialog component
 *
 * Modal dialog for creating a new playlist with name input and validation.
 *
 * Requirements: 4.1
 */
export function CreatePlaylistDialog({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  onCreated
}: CreatePlaylistDialogProps): React.JSX.Element | null {
  // Use UI store if props not provided
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

  // Focus input when dialog opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setName('')
      setLocalError(null)
      clearError()
    }
  }, [isOpen, clearError])

  // Validate name
  const validateName = (value: string): string | null => {
    const trimmed = value.trim()

    if (!trimmed) {
      return '请输入播放列表名称'
    }

    if (trimmed.length > 100) {
      return '播放列表名称不能超过 100 个字符'
    }

    // Check for duplicate names
    const exists = playlists.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      return '已存在同名的播放列表'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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

      // Find the newly created playlist
      const newPlaylist = usePlaylistStore
        .getState()
        .playlists.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())

      if (onCreated && newPlaylist) {
        onCreated(newPlaylist.id)
      }

      onClose()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '创建播放列表失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (): void => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose()
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
    // Clear error when user starts typing
    if (localError) {
      setLocalError(null)
    }
  }

  if (!isOpen) {
    return null
  }

  const displayError = localError || error

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white">
              <PlaylistIcon />
            </div>
            <h2 id="create-playlist-title" className="text-lg font-semibold text-zinc-100">
              创建播放列表
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="playlist-name"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                播放列表名称
              </label>
              <input
                ref={inputRef}
                id="playlist-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  displayError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-700 focus:border-zinc-500'
                }`}
                placeholder="输入播放列表名称"
                maxLength={100}
                autoComplete="off"
              />
              {displayError && <p className="mt-2 text-sm text-red-400">{displayError}</p>}
            </div>

            <p className="text-xs text-zinc-500">创建后，你可以从音乐库中添加歌曲到这个播放列表</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
