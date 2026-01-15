import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { TrackMetadata } from '@shared/types'
import { usePlayerStore } from '@renderer/stores/player-store'
import { useUIStore } from '@renderer/stores/ui-store'
import { formatTime } from '@renderer/utils/format'
import { LazyImage, DefaultAlbumArt } from '@renderer/components/common'

/**
 * Close icon
 */
const CloseIcon = React.memo(function CloseIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
})

/**
 * Drag handle icon
 */
const DragHandleIcon = React.memo(function DragHandleIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
    </svg>
  )
})

/**
 * Delete icon
 */
const DeleteIcon = React.memo(function DeleteIcon(): React.JSX.Element {
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
})

/**
 * Clear all icon
 */
const ClearAllIcon = React.memo(function ClearAllIcon(): React.JSX.Element {
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
})

/**
 * Default album art placeholder
 */
const DefaultTrackArt = React.memo(function DefaultTrackArt(): React.JSX.Element {
  return <DefaultAlbumArt size="sm" />
})

/**
 * Playing indicator icon
 */
const PlayingIndicator = React.memo(function PlayingIndicator(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center">
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

interface QueueItemProps {
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
 * Individual queue item with drag support
 * Memoized for performance
 */
const QueueItem = React.memo(
  function QueueItem({
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
  }: QueueItemProps): React.JSX.Element {
    return (
      <div
        className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
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
        <div className="w-6 flex-shrink-0 text-center">
          {isCurrentTrack && isPlaying ? (
            <PlayingIndicator />
          ) : (
            <span className={`text-xs ${isCurrentTrack ? 'text-green-500' : 'text-zinc-500'}`}>
              {index + 1}
            </span>
          )}
        </div>

        {/* Album art with lazy loading */}
        <LazyImage
          src={track.coverUrl}
          alt={track.album || 'Album art'}
          className="h-10 w-10 flex-shrink-0 rounded object-cover"
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

        {/* Duration */}
        <div className="flex-shrink-0 text-right">
          <span className="text-xs text-zinc-500">{formatTime(track.duration)}</span>
        </div>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-zinc-600 opacity-0 transition-all hover:bg-zinc-700 hover:text-red-400 group-hover:opacity-100"
          title="从队列中移除"
        >
          <DeleteIcon />
        </button>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track.id === nextProps.track.id &&
      prevProps.index === nextProps.index &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.isCurrentTrack === nextProps.isCurrentTrack &&
      prevProps.isDragging === nextProps.isDragging
    )
  }
)

/**
 * Empty state when queue is empty
 */
function EmptyQueueState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        <svg
          className="h-6 w-6 text-zinc-500"
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
      <h3 className="mb-1 text-sm font-medium text-zinc-100">队列为空</h3>
      <p className="text-xs text-zinc-400">从音乐库中添加歌曲到队列</p>
    </div>
  )
}

/**
 * Now playing section showing current track
 */
const NowPlayingSection = React.memo(function NowPlayingSection(): React.JSX.Element {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)

  if (!currentTrack) {
    return (
      <div className="border-b border-zinc-800 p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">正在播放</p>
        <p className="mt-2 text-sm text-zinc-400">没有正在播放的歌曲</p>
      </div>
    )
  }

  return (
    <div className="border-b border-zinc-800 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">正在播放</p>
      <div className="flex items-center gap-3">
        {/* Album art with lazy loading */}
        <LazyImage
          src={currentTrack.coverUrl}
          alt={currentTrack.album || 'Album art'}
          className="h-14 w-14 flex-shrink-0 rounded object-cover shadow-lg"
          fallback={<DefaultAlbumArt size="md" className="shadow-lg" />}
        />

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isPlaying && <PlayingIndicator />}
            <p className="truncate text-sm font-medium text-green-500">{currentTrack.title}</p>
          </div>
          <p className="truncate text-xs text-zinc-400">{currentTrack.artist}</p>
          <p className="truncate text-xs text-zinc-500">{currentTrack.album}</p>
        </div>
      </div>
    </div>
  )
})

/**
 * QueuePanel component
 *
 * Displays the current playback queue as a side panel with:
 * - Current playing track display
 * - Queue list with drag-and-drop reordering
 * - Remove individual tracks or clear entire queue
 *
 * Requirements: 6.2, 6.3, 6.4, 6.5
 */
export function QueuePanel(): React.JSX.Element {
  const queue = usePlayerStore((state) => state.queue)
  const queueIndex = usePlayerStore((state) => state.queueIndex)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue)
  const clearQueue = usePlayerStore((state) => state.clearQueue)
  const reorderQueue = usePlayerStore((state) => state.reorderQueue)
  const play = usePlayerStore((state) => state.play)

  const setQueueVisible = useUIStore((state) => state.setQueueVisible)

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  // Get upcoming tracks (after current)
  const upcomingTracks = React.useMemo(() => {
    if (queueIndex < 0) return queue
    return queue.slice(queueIndex + 1)
  }, [queue, queueIndex])

  // Get the actual index in the full queue for upcoming tracks
  const getActualIndex = (upcomingIndex: number): number => {
    if (queueIndex < 0) return upcomingIndex
    return queueIndex + 1 + upcomingIndex
  }

  const handleClose = (): void => {
    setQueueVisible(false)
  }

  const handleClearQueue = (): void => {
    clearQueue()
  }

  const handleDoubleClick = (track: TrackMetadata): void => {
    play(track)
  }

  const handleRemoveTrack = (actualIndex: number): void => {
    removeFromQueue(actualIndex)
  }

  const handleDragStart = (e: React.DragEvent, index: number): void => {
    const actualIndex = getActualIndex(index)
    setDraggedIndex(actualIndex)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', actualIndex.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const actualIndex = getActualIndex(index)
    setDragOverIndex(actualIndex)
  }

  const handleDragEnd = (): void => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, index: number): void => {
    e.preventDefault()
    const fromIndex = draggedIndex
    const toIndex = getActualIndex(index)

    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderQueue(fromIndex, toIndex)
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-3">
        <h2 className="text-lg font-semibold text-zinc-100">播放队列</h2>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={handleClearQueue}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
              title="清空队列"
            >
              <ClearAllIcon />
              <span>清空</span>
            </button>
          )}
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            title="关闭队列面板"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Now playing section */}
      <NowPlayingSection />

      {/* Queue list */}
      <div className="flex-1 overflow-hidden">
        {queue.length === 0 ? (
          <EmptyQueueState />
        ) : upcomingTracks.length === 0 ? (
          <div className="p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              接下来播放
            </p>
            <p className="text-sm text-zinc-400">队列中没有更多歌曲</p>
          </div>
        ) : (
          <div className="h-full">
            <div className="p-3 pb-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                接下来播放 ({upcomingTracks.length})
              </p>
            </div>

            {/* Virtualized queue list */}
            <Virtuoso
              style={{ height: 'calc(100% - 32px)' }}
              totalCount={upcomingTracks.length}
              itemContent={(index) => {
                const track = upcomingTracks[index]
                const actualIndex = getActualIndex(index)
                const isCurrentTrack = currentTrack?.id === track.id
                const isDragging = draggedIndex === actualIndex
                const isDragOver = dragOverIndex === actualIndex && draggedIndex !== actualIndex

                return (
                  <div className={`px-2 ${isDragOver ? 'border-t-2 border-green-500' : ''}`}>
                    <QueueItem
                      track={track}
                      index={actualIndex}
                      isPlaying={isPlaying}
                      isCurrentTrack={isCurrentTrack}
                      isDragging={isDragging}
                      onDoubleClick={() => handleDoubleClick(track)}
                      onRemove={() => handleRemoveTrack(actualIndex)}
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

      {/* Footer with queue info */}
      {queue.length > 0 && (
        <div className="border-t border-zinc-800 p-3">
          <p className="text-xs text-zinc-500">
            {queue.length} 首歌曲 ·{' '}
            {formatTime(queue.reduce((sum, track) => sum + track.duration, 0))}
          </p>
        </div>
      )}
    </div>
  )
}
