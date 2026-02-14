import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { TrackMetadata } from '@shared/types'
import { usePlayerStore } from '@renderer/stores/player-store'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { formatTime } from '@renderer/utils/format'
import { LazyImage, DefaultAlbumArt } from '@renderer/components/common'

const DefaultTrackArt = React.memo(function DefaultTrackArt(): React.JSX.Element {
  return <DefaultAlbumArt size="sm" />
})

const PlayingIndicator = React.memo(function PlayingIndicator(): React.JSX.Element {
  return (
    <div className="flex h-10 w-10 items-center justify-center">
      <div className="flex items-end gap-0.5">
        <div
          className="h-3 w-1 animate-pulse rounded-full bg-orange-500"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="h-4 w-1 animate-pulse rounded-full bg-orange-500"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="h-2 w-1 animate-pulse rounded-full bg-orange-500"
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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const adjustedX = Math.min(x, window.innerWidth - 220)
  const adjustedY = Math.min(y, window.innerHeight - 280)

  return (
    <div
      ref={menuRef}
      className="glass-panel fixed z-50 min-w-52 rounded-xl py-1"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="border-b border-zinc-200/70 px-3 py-2 dark:border-zinc-700/70">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {track.title}
        </p>
        <p className="truncate text-xs text-zinc-600 dark:text-zinc-300">{track.artist}</p>
      </div>

      <button
        onClick={() => {
          onPlayNext()
          onClose()
        }}
        className="interactive-soft flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
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
        className="interactive-soft flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
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
          <div className="my-1 border-t border-zinc-200/70 dark:border-zinc-700/70" />
          <div className="px-3 py-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">添加到播放列表</p>
          </div>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                onAddToPlaylist(playlist.id)
                onClose()
              }}
              className="interactive-soft flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
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
        className={`interactive-soft group flex items-center gap-3 rounded-xl px-3 py-2 ${
          isCurrentTrack
            ? 'bg-orange-100/70 dark:bg-orange-500/24 dark:ring-1 dark:ring-orange-300/30'
            : 'hover:bg-zinc-200/55 dark:hover:bg-slate-800/58'
        }`}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      >
        <div className="w-8 text-center">
          {isCurrentTrack && isPlaying ? (
            <PlayingIndicator />
          ) : (
            <span
              className={`text-sm ${isCurrentTrack ? 'text-orange-500 dark:text-orange-300' : 'text-zinc-500 dark:text-zinc-300'}`}
            >
              {index + 1}
            </span>
          )}
        </div>

        <LazyImage
          src={track.coverUrl}
          alt={track.album || 'Album art'}
          className="h-10 w-10 rounded-lg object-cover"
          fallback={<DefaultTrackArt />}
        />

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${isCurrentTrack ? 'text-orange-600 dark:text-orange-200' : 'text-zinc-900 dark:text-zinc-50'}`}
          >
            {track.title}
          </p>
          <p className="truncate text-xs text-zinc-600 dark:text-zinc-200/90">{track.artist}</p>
        </div>

        <div className="hidden w-1/4 min-w-0 md:block">
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-200/90">{track.album}</p>
        </div>

        <div className="w-12 text-right">
          <span className="text-sm text-zinc-600 dark:text-zinc-200/90">
            {formatTime(track.duration)}
          </span>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track.id === nextProps.track.id &&
      prevProps.index === nextProps.index &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.isCurrentTrack === nextProps.isCurrentTrack
    )
  }
)

function EmptyState(): React.JSX.Element {
  return (
    <div className="glass-soft flex flex-col items-center justify-center rounded-2xl py-16 text-center">
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
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">没有歌曲</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">添加文件夹来导入音乐</p>
    </div>
  )
}

export interface TrackListProps {
  tracks: TrackMetadata[]
  header?: React.ReactNode
  height?: number | string
}

export function TrackList({ tracks, header, height = '100%' }: TrackListProps): React.JSX.Element {
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

  if (tracks.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative min-h-0 flex-1 rounded-2xl dark:border dark:border-white/10 dark:bg-slate-950/20 dark:px-2 dark:py-1">
      {header || (
        <div className="mb-2 flex items-center gap-3 border-b border-zinc-200/70 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-white/18 dark:text-zinc-300">
          <div className="w-8 text-center">#</div>
          <div className="w-10" />
          <div className="min-w-0 flex-1">标题</div>
          <div className="hidden w-1/4 min-w-0 md:block">专辑</div>
          <div className="w-12 text-right">时长</div>
        </div>
      )}

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

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          onClose={() => setContextMenu(null)}
          onAddToQueue={() => addToQueue(contextMenu.track)}
          onPlayNext={() => addToQueueNext(contextMenu.track)}
          onAddToPlaylist={(playlistId) => addTrackToPlaylist(playlistId, contextMenu.track)}
        />
      )}
    </div>
  )
}
