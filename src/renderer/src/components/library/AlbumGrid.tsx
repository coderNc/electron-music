import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { Album } from '@shared/types'
import { useLibraryStore } from '@renderer/stores/library-store'
import { usePlayerStore } from '@renderer/stores/player-store'
import { LazyImage, DefaultAlbumArt } from '@renderer/components/common'

/**
 * Play icon overlay
 */
const PlayOverlay = React.memo(function PlayOverlay(): React.JSX.Element {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-zinc-900">
        <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  )
})

interface AlbumCardProps {
  album: Album
  onPlay: () => void
  onClick: () => void
}

/**
 * Individual album card
 * Memoized for performance with large libraries
 */
const AlbumCard = React.memo(
  function AlbumCard({ album, onPlay, onClick }: AlbumCardProps): React.JSX.Element {
    const handlePlayClick = (e: React.MouseEvent): void => {
      e.stopPropagation()
      onPlay()
    }

    return (
      <div
        className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-zinc-800/50"
        onClick={onClick}
      >
        {/* Album art with lazy loading */}
        <div className="relative mb-3">
          <LazyImage
            src={album.coverData}
            alt={album.name}
            className="aspect-square w-full rounded-lg object-cover"
            fallback={<DefaultAlbumArt size="lg" className="rounded-lg" />}
          />
          <div onClick={handlePlayClick}>
            <PlayOverlay />
          </div>
        </div>

        {/* Album info */}
        <h3 className="truncate text-sm font-medium text-zinc-100">{album.name}</h3>
        <p className="truncate text-xs text-zinc-400">
          {album.artist}
          {album.year && <span className="ml-1">• {album.year}</span>}
        </p>
        <p className="text-xs text-zinc-500">{album.trackCount} 首歌曲</p>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
      prevProps.album.name === nextProps.album.name &&
      prevProps.album.artist === nextProps.album.artist &&
      prevProps.album.trackCount === nextProps.album.trackCount &&
      prevProps.album.coverData === nextProps.album.coverData
    )
  }
)

/**
 * Empty state when no albums are available
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-100">没有专辑</h3>
      <p className="text-sm text-zinc-400">添加音乐文件夹来查看专辑</p>
    </div>
  )
}

export interface AlbumGridProps {
  /** Optional filter by artist name */
  artistFilter?: string
  /** Callback when an album is selected */
  onSelectAlbum?: (album: Album) => void
  /** Height of the grid container */
  height?: number | string
}

/**
 * AlbumGrid component
 *
 * Grid view of albums with cover art and play functionality.
 * Uses virtualization for performance with large libraries.
 *
 * Requirements: 5.4, 5.5
 */
export function AlbumGrid({
  artistFilter,
  onSelectAlbum,
  height = 'calc(100vh - 200px)'
}: AlbumGridProps): React.JSX.Element {
  const getAlbums = useLibraryStore((state) => state.getAlbums)
  const setQueue = usePlayerStore((state) => state.setQueue)

  const allAlbums = getAlbums()

  // Filter albums by artist if filter is provided
  const albums = React.useMemo(() => {
    if (!artistFilter) return allAlbums
    return allAlbums.filter((album) => album.artist.toLowerCase() === artistFilter.toLowerCase())
  }, [allAlbums, artistFilter])

  // Group albums into rows of 4 for virtualization
  const COLUMNS = 4
  const rows = React.useMemo(() => {
    const result: Album[][] = []
    for (let i = 0; i < albums.length; i += COLUMNS) {
      result.push(albums.slice(i, i + COLUMNS))
    }
    return result
  }, [albums])

  const handlePlayAlbum = (album: Album): void => {
    if (album.tracks.length > 0) {
      setQueue(album.tracks, 0)
    }
  }

  const handleSelectAlbum = (album: Album): void => {
    if (onSelectAlbum) {
      onSelectAlbum(album)
    }
  }

  if (albums.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">专辑 ({albums.length})</h3>
      </div>

      <Virtuoso
        style={{ height }}
        totalCount={rows.length}
        itemContent={(index) => {
          const row = rows[index]
          return (
            <div className="grid grid-cols-4 gap-4 pb-4">
              {row.map((album) => (
                <AlbumCard
                  key={`${album.name}-${album.artist}`}
                  album={album}
                  onPlay={() => handlePlayAlbum(album)}
                  onClick={() => handleSelectAlbum(album)}
                />
              ))}
              {/* Fill empty cells to maintain grid alignment */}
              {row.length < COLUMNS &&
                Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
            </div>
          )
        }}
      />
    </div>
  )
}
