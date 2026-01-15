import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { Artist } from '@shared/types'
import { useLibraryStore } from '@renderer/stores/library-store'
import { usePlayerStore } from '@renderer/stores/player-store'
import { LazyImage } from '@renderer/components/common'

/**
 * Default artist avatar placeholder
 */
function DefaultArtistAvatar(): React.JSX.Element {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
      <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
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

interface ArtistItemProps {
  artist: Artist
  onPlay: () => void
  onClick: () => void
}

/**
 * Individual artist item
 */
function ArtistItem({ artist, onPlay, onClick }: ArtistItemProps): React.JSX.Element {
  // Get the first album cover as artist avatar
  const avatarUrl = artist.albums[0]?.coverData

  const handlePlayClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onPlay()
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-zinc-800/50"
      onClick={onClick}
    >
      {/* Artist avatar with lazy loading and fallback */}
      <LazyImage
        src={avatarUrl}
        alt={artist.name}
        className="h-12 w-12 rounded-full object-cover"
        fallback={<DefaultArtistAvatar />}
      />

      {/* Artist info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-zinc-100">{artist.name}</h3>
        <p className="text-xs text-zinc-400">
          {artist.albumCount} 张专辑 • {artist.trackCount} 首歌曲
        </p>
      </div>

      {/* Play button */}
      <button
        onClick={handlePlayClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-zinc-900 opacity-0 transition-opacity group-hover:opacity-100"
        title="播放所有歌曲"
      >
        <PlayIcon />
      </button>
    </div>
  )
}

/**
 * Empty state when no artists are available
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-100">没有艺术家</h3>
      <p className="text-sm text-zinc-400">添加音乐文件夹来查看艺术家</p>
    </div>
  )
}

export interface ArtistListProps {
  /** Callback when an artist is selected */
  onSelectArtist?: (artist: Artist) => void
  /** Height of the list container */
  height?: number | string
}

/**
 * ArtistList component
 *
 * List view of artists with play functionality.
 * Uses virtualization for performance with large libraries.
 *
 * Requirements: 5.4, 5.5
 */
export function ArtistList({
  onSelectArtist,
  height = 'calc(100vh - 200px)'
}: ArtistListProps): React.JSX.Element {
  const getArtists = useLibraryStore((state) => state.getArtists)
  const getTracksByArtist = useLibraryStore((state) => state.getTracksByArtist)
  const setQueue = usePlayerStore((state) => state.setQueue)

  const artists = getArtists()

  const handlePlayArtist = (artist: Artist): void => {
    const tracks = getTracksByArtist(artist.name)
    if (tracks.length > 0) {
      setQueue(tracks, 0)
    }
  }

  const handleSelectArtist = (artist: Artist): void => {
    if (onSelectArtist) {
      onSelectArtist(artist)
    }
  }

  if (artists.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">艺术家 ({artists.length})</h3>
      </div>

      <Virtuoso
        style={{ height }}
        totalCount={artists.length}
        itemContent={(index) => {
          const artist = artists[index]
          return (
            <ArtistItem
              artist={artist}
              onPlay={() => handlePlayArtist(artist)}
              onClick={() => handleSelectArtist(artist)}
            />
          )
        }}
      />
    </div>
  )
}
