import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { TrackMetadata, Playlist } from '@shared/types'
import { usePlaylistStore } from '@renderer/stores/playlist-store'
import { useLibraryStore } from '@renderer/stores/library-store'
import { usePlayerStore } from '@renderer/stores/player-store'
import { formatTime } from '@renderer/utils/format'
import { LazyImage, DefaultAlbumArt } from '@renderer/components/common'

/**
 * Back arrow icon
 */
function BackIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

/**
 * Drag handle icon
 */
function DragHandleIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
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
 * Play icon
 */
function PlayIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

/**
 * Playlist icon
 */
function PlaylistIcon(): React.JSX.Element {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
 * Playing indicator icon
 */
function PlayingIndicator(): React.JSX.Element {
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
}

interface PlaylistTrackItemProps {
  track: TrackMetadata
  index: number
  isPlaying: boolean
  isCurrentTrack: boolean
  isDragging: boolean
  onDoubleClick: () => void
  onRemove: () => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onDrop: (e: React.DragEvent, index: number) => void
}

/**
 * Individual track item in the playlist with drag support
 */
function PlaylistTrackItem({
  track,
  index,
  isPlaying,
  isCurrentTrack,
  isDragging,
  onDoubleClick,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}: PlaylistTrackItemProps): React.JSX.Element {
  return (
    <div
      className={`group flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
        isDragging ? 'opacity-50' : ''
      } ${isCurrentTrack ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/50'}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      onDoubleClick={onDoubleClick}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <DragHandleIcon />
      </div>

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

      {/* Album art with lazy loading and fallback */}
      <LazyImage
        src={track.coverUrl}
        alt={track.album || 'Album art'}
        className="h-10 w-10 rounded object-cover"
        fallback={<DefaultAlbumArt size="sm" />}
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

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 opacity-0 transition-all hover:bg-zinc-700 hover:text-red-400 group-hover:opacity-100"
        title="从播放列表中移除"
      >
        <DeleteIcon />
      </button>
    </div>
  )
}

/**
 * Empty state when playlist has no tracks
 */
function EmptyPlaylistState(): React.JSX.Element {
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
      <h3 className="mb-2 text-lg font-medium text-zinc-100">播放列表为空</h3>
      <p className="text-sm text-zinc-400">从音乐库中添加歌曲到这个播放列表</p>
    </div>
  )
}

export interface PlaylistDetailProps {
  /** The playlist to display */
  playlist: Playlist
  /** Callback when back button is clicked */
  onBack: () => void
}

/**
 * PlaylistDetail component
 *
 * Displays playlist details with track list, drag-and-drop reordering,
 * and track removal functionality.
 *
 * Requirements: 4.3, 4.6
 */
export function PlaylistDetail({ playlist, onBack }: PlaylistDetailProps): React.JSX.Element {
  const tracks = useLibraryStore((state) => state.tracks)
  const getPlaylistTracks = usePlaylistStore((state) => state.getPlaylistTracks)
  const removeTrackFromPlaylist = usePlaylistStore((state) => state.removeTrackFromPlaylist)
  const reorderPlaylistTracks = usePlaylistStore((state) => state.reorderPlaylistTracks)

  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const setQueue = usePlayerStore((state) => state.setQueue)

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  // Get the actual track objects for this playlist
  const playlistTracks = React.useMemo(() => {
    return getPlaylistTracks(playlist.id, tracks)
  }, [playlist.id, tracks, getPlaylistTracks])

  // Calculate total duration
  const totalDuration = React.useMemo(() => {
    return playlistTracks.reduce((sum, track) => sum + track.duration, 0)
  }, [playlistTracks])

  const handlePlayAll = (): void => {
    if (playlistTracks.length > 0) {
      setQueue(playlistTracks, 0)
    }
  }

  const handleDoubleClick = (index: number): void => {
    setQueue(playlistTracks, index)
  }

  const handleRemoveTrack = (index: number): void => {
    removeTrackFromPlaylist(playlist.id, index)
  }

  const handleDragStart = (e: React.DragEvent, index: number): void => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragEnd = (): void => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number): void => {
    e.preventDefault()
    const fromIndex = draggedIndex

    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderPlaylistTracks(playlist.id, fromIndex, toIndex)
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <BackIcon />
        返回播放列表
      </button>

      {/* Playlist header */}
      <div className="flex items-start gap-6">
        {/* Playlist cover */}
        <div className="flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg">
          <PlaylistIcon />
        </div>

        {/* Playlist info */}
        <div className="flex flex-col justify-end py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">播放列表</p>
          <h1 className="mb-2 text-4xl font-bold text-zinc-100">{playlist.name}</h1>
          <p className="text-sm text-zinc-400">
            {playlistTracks.length} 首歌曲 · {formatTime(totalDuration)}
          </p>

          {/* Play button */}
          {playlistTracks.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg transition-transform hover:scale-105"
              title="播放全部"
            >
              <PlayIcon />
            </button>
          )}
        </div>
      </div>

      {/* Track list */}
      {playlistTracks.length === 0 ? (
        <EmptyPlaylistState />
      ) : (
        <div>
          {/* Header row */}
          <div className="mb-2 flex items-center gap-3 border-b border-zinc-800 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <div className="w-4" /> {/* Drag handle space */}
            <div className="w-8 text-center">#</div>
            <div className="w-10" /> {/* Album art space */}
            <div className="min-w-0 flex-1">标题</div>
            <div className="hidden w-1/4 min-w-0 md:block">专辑</div>
            <div className="w-12 text-right">时长</div>
            <div className="w-8" /> {/* Remove button space */}
          </div>

          {/* Virtualized track list */}
          <Virtuoso
            style={{ height: 'calc(100vh - 420px)' }}
            totalCount={playlistTracks.length}
            itemContent={(index) => {
              const track = playlistTracks[index]
              const isCurrentTrack = currentTrack?.id === track.id
              const isDragging = draggedIndex === index
              const isDragOver = dragOverIndex === index && draggedIndex !== index

              return (
                <div className={isDragOver ? 'border-t-2 border-green-500' : ''}>
                  <PlaylistTrackItem
                    track={track}
                    index={index}
                    isPlaying={isPlaying}
                    isCurrentTrack={isCurrentTrack}
                    isDragging={isDragging}
                    onDoubleClick={() => handleDoubleClick(index)}
                    onRemove={() => handleRemoveTrack(index)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                  />
                </div>
              )
            }}
          />
        </div>
      )}
    </div>
  )
}
