import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { TrackMetadata } from '@shared/types'
import { usePlayerStore } from '@renderer/stores/player-store'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { formatTime } from '@renderer/utils/format'
import { LazyImage, DefaultAlbumArt } from '@renderer/components/common'

/**
 * Default album art placeholder for track items
 */
const DefaultTrackArt = React.memo(function DefaultTrackArt(): React.JSX.Element {
  return <DefaultAlbumArt size="sm" />
})

/**
 * Playing indicator icon
 */
const PlayingIndicator = React.memo(function PlayingIndicator(): React.JSX.Element {
  return (
    <div className="flex h-10 w-10 items-center justify-center">
      <div className="flex items-end gap-0.5">
        <div
          className="h-3 w-1 animate-pulse rounded-full bg-green-500"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="h-4 w-1 animate-pulse rounded-full bg-green-500"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="h-2 w-1 animate-pulse rounded-full bg-green-500"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
})

interface ContextMenuProps {
  x: number
  y: number
  track: TrackMetadata
  onClose: () => void
  onAddToQueue: () => void
  onPlayNext: () => void
  onAddToPlaylist: (playlistId: string) => void
}

/**
 * Context menu for track actions
 */
function ContextMenu({
  x,
  y,
  track,
  onClose,
  onAddToQueue,
  onPlayNext,
  onAddToPlaylist
}: ContextMenuProps): React.JSX.Element {
  const playlists = usePlaylistStore((state) => state.playlists)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Adjust position to keep menu in viewport
  const adjustedX = Math.min(x, window.innerWidth - 200)
  const adjustedY = Math.min(y, window.innerHeight - 250)

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="border-b border-zinc-800 px-3 py-2">
        <p className="truncate text-sm font-medium text-zinc-100">{track.title}</p>
        <p className="truncate text-xs text-zinc-400">{track.artist}</p>
      </div>

      <button
        onClick={() => {
          onPlayNext()
          onClose()
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
        下一首播放
      </button>

      <button
        onClick={() => {
          onAddToQueue()
          onClose()
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        添加到队列
      </button>

      {playlists.length > 0 && (
        <>
          <div className="my-1 border-t border-zinc-800" />
          <div className="px-3 py-1">
            <p className="text-xs font-medium text-zinc-500">添加到播放列表</p>
          </div>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                onAddToPlaylist(playlist.id)
                onClose()
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              {playlist.name}
            </button>
          ))}
        </>
      )}
    </div>
  )
}

interface TrackItemProps {
  track: TrackMetadata
  index: number
  isPlaying: boolean
  isCurrentTrack: boolean
  onDoubleClick: () => void
  onContextMenu: (event: React.MouseEvent) => void
}

/**
 * Individual track item in the list
 * Memoized for performance with large lists
 */
const TrackItem = React.memo(
  function TrackItem({
    track,
    index,
    isPlaying,
    isCurrentTrack,
    onDoubleClick,
    onContextMenu
  }: TrackItemProps): React.JSX.Element {
    return (
      <div
        className={`group flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
          isCurrentTrack ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/50'
        }`}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      >
        {/* Track number or playing indicator */}
        <div className="w-8 text-center">
          {isCurrentTrack && isPlaying ? (
            <PlayingIndicator />
          ) : (
            <span className={`text-sm ${isCurrentTrack ? 'text-green-500' : 'text-zinc-500'}`}>
              {index + 1}
            </span>
          )}
        </div>

        {/* Album art with lazy loading */}
        <LazyImage
          src={track.coverUrl}
          alt={track.album || 'Album art'}
          className="h-10 w-10 rounded object-cover"
          fallback={<DefaultTrackArt />}
        />

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${isCurrentTrack ? 'text-green-500' : 'text-zinc-100'}`}
          >
            {track.title}
          </p>
          <p className="truncate text-xs text-zinc-400">{track.artist}</p>
        </div>

        {/* Album */}
        <div className="hidden w-1/4 min-w-0 md:block">
          <p className="truncate text-sm text-zinc-400">{track.album}</p>
        </div>

        {/* Duration */}
        <div className="w-12 text-right">
          <span className="text-sm text-zinc-400">{formatTime(track.duration)}</span>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
      prevProps.track.id === nextProps.track.id &&
      prevProps.index === nextProps.index &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.isCurrentTrack === nextProps.isCurrentTrack
    )
  }
)

/**
 * Empty state when no tracks are available
 */
function EmptyState(): React.JSX.Element {
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
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-100">没有歌曲</h3>
      <p className="text-sm text-zinc-400">添加文件夹来导入音乐</p>
    </div>
  )
}

export interface TrackListProps {
  /** List of tracks to display */
  tracks: TrackMetadata[]
  /** Optional header content */
  header?: React.ReactNode
  /** Height of the list container */
  height?: number | string
}

/**
 * TrackList component
 *
 * Virtualized list of tracks using react-virtuoso for performance.
 * Supports double-click to play and right-click context menu.
 *
 * Requirements: 2.2, 2.5, 8.5, 8.6
 */
export function TrackList({
  tracks,
  header,
  height = 'calc(100vh - 280px)'
}: TrackListProps): React.JSX.Element {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const setQueue = usePlayerStore((state) => state.setQueue)
  const addToQueue = usePlayerStore((state) => state.addToQueue)
  const addToQueueNext = usePlayerStore((state) => state.addToQueueNext)
  const addTrackToPlaylist = usePlaylistStore((state) => state.addTrackToPlaylist)

  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
    track: TrackMetadata
  } | null>(null)

  const handleDoubleClick = (_track: TrackMetadata, index: number): void => {
    // Set the queue to all tracks starting from the clicked track
    setQueue(tracks, index)
  }

  const handleContextMenu = (event: React.MouseEvent, track: TrackMetadata): void => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      track
    })
  }

  const handleAddToQueue = (track: TrackMetadata): void => {
    addToQueue(track)
  }

  const handlePlayNext = (track: TrackMetadata): void => {
    addToQueueNext(track)
  }

  const handleAddToPlaylist = (playlistId: string, track: TrackMetadata): void => {
    addTrackToPlaylist(playlistId, track)
  }

  if (tracks.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative">
      {/* Header row */}
      {header || (
        <div className="mb-2 flex items-center gap-3 border-b border-zinc-800 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <div className="w-8 text-center">#</div>
          <div className="w-10" /> {/* Album art space */}
          <div className="min-w-0 flex-1">标题</div>
          <div className="hidden w-1/4 min-w-0 md:block">专辑</div>
          <div className="w-12 text-right">时长</div>
        </div>
      )}

      {/* Virtualized track list */}
      <Virtuoso
        style={{ height }}
        totalCount={tracks.length}
        itemContent={(index) => {
          const track = tracks[index]
          const isCurrentTrack = currentTrack?.id === track.id

          return (
            <TrackItem
              track={track}
              index={index}
              isPlaying={isPlaying}
              isCurrentTrack={isCurrentTrack}
              onDoubleClick={() => handleDoubleClick(track, index)}
              onContextMenu={(e) => handleContextMenu(e, track)}
            />
          )
        }}
      />

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          onClose={() => setContextMenu(null)}
          onAddToQueue={() => handleAddToQueue(contextMenu.track)}
          onPlayNext={() => handlePlayNext(contextMenu.track)}
          onAddToPlaylist={(playlistId) => handleAddToPlaylist(playlistId, contextMenu.track)}
        />
      )}
    </div>
  )
}
