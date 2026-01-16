import * as React from 'react'
import { useLibraryStore } from '@renderer/stores/library-store'
import { TrackList } from './TrackList'
import { SearchBar } from './SearchBar'
import { ScanProgress } from './ScanProgress'
import { useSearchInputRef } from '@renderer/contexts'
import type { FolderInfo } from '@shared/types'

/**
 * Folder icon
 */
function FolderIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

/**
 * Add folder icon
 */
function AddFolderIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      />
    </svg>
  )
}

/**
 * Refresh icon
 */
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

interface FolderItemProps {
  folder: FolderInfo
  onRefresh: (folderId: string) => void
  onRemove: (folderId: string) => void
  isScanning: boolean
}

/**
 * Individual folder item in the folder list
 */
function FolderItem({
  folder,
  onRefresh,
  onRemove,
  isScanning
}: FolderItemProps): React.JSX.Element {
  return (
    <div className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
          <FolderIcon />
        </div>
        <div>
          <h3 className="font-medium text-zinc-100">{folder.name}</h3>
          <p className="text-sm text-zinc-500">{folder.trackCount} 首歌曲</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onRefresh(folder.id)}
          disabled={isScanning}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="刷新文件夹"
        >
          <RefreshIcon />
        </button>
        <button
          onClick={() => onRemove(folder.id)}
          disabled={isScanning}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          title="移除文件夹"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  )
}

/**
 * Empty state when no folders are added
 */
function EmptyState({ onAddFolder }: { onAddFolder: () => void }): React.JSX.Element {
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
      <h3 className="mb-2 text-lg font-medium text-zinc-100">音乐库为空</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-400">
        添加包含音乐文件的文件夹来开始使用。支持 MP3、FLAC、WAV、AAC、OGG 等格式。
      </p>
      <button
        onClick={onAddFolder}
        className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
      >
        <AddFolderIcon />
        添加文件夹
      </button>
    </div>
  )
}

export interface LibraryViewProps {
  /** Callback when a folder is selected to view its tracks */
  onSelectFolder?: (folderId: string) => void
}

/**
 * Section showing all tracks in the library
 */
function AllTracksSection(): React.JSX.Element {
  const tracks = useLibraryStore((state) => state.tracks)
  const getFilteredTracks = useLibraryStore((state) => state.getFilteredTracks)
  const searchQuery = useLibraryStore((state) => state.searchQuery)

  const displayTracks = searchQuery ? getFilteredTracks() : tracks

  if (tracks.length === 0) {
    return <></>
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400">
        所有歌曲 ({displayTracks.length})
        {searchQuery && displayTracks.length !== tracks.length && (
          <span className="ml-2 text-zinc-500">(共 {tracks.length} 首)</span>
        )}
      </h3>
      <TrackList tracks={displayTracks} />
    </div>
  )
}

/**
 * LibraryView component
 *
 * Main view for the music library showing folder list and add folder button.
 * Displays scanning progress when folders are being scanned.
 *
 * Requirements: 1.1, 2.1
 */
export function LibraryView({ onSelectFolder }: LibraryViewProps): React.JSX.Element {
  const folders = useLibraryStore((state) => state.folders)
  const isScanning = useLibraryStore((state) => state.isScanning)
  const scanProgress = useLibraryStore((state) => state.scanProgress)
  const error = useLibraryStore((state) => state.error)

  const addFolder = useLibraryStore((state) => state.addFolder)
  const removeFolder = useLibraryStore((state) => state.removeFolder)
  const refreshFolder = useLibraryStore((state) => state.refreshFolder)
  const clearError = useLibraryStore((state) => state.clearError)

  const searchInputRef = useSearchInputRef()

  const handleAddFolder = (): void => {
    addFolder()
  }

  const handleRefreshFolder = (folderId: string): void => {
    refreshFolder(folderId)
  }

  const handleRemoveFolder = (folderId: string): void => {
    removeFolder(folderId)
  }

  const handleFolderClick = (folderId: string): void => {
    if (onSelectFolder) {
      onSelectFolder(folderId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-100">音乐库</h2>
        <div className="flex items-center gap-3">
          <SearchBar className="w-64" inputRef={searchInputRef ?? undefined} />
          <button
            onClick={handleAddFolder}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AddFolderIcon />
            添加文件夹
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-900/50 bg-red-900/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="text-sm text-red-400 underline hover:text-red-300"
          >
            关闭
          </button>
        </div>
      )}

      {/* Scanning progress */}
      {isScanning && (
        <ScanProgress
          current={scanProgress.current}
          total={scanProgress.total}
          currentFile={scanProgress.currentFile}
        />
      )}

      {/* Folder list or empty state */}
      {folders.length === 0 && !isScanning ? (
        <EmptyState onAddFolder={handleAddFolder} />
      ) : (
        <div className="space-y-6">
          {/* Folder list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400">文件夹 ({folders.length})</h3>
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={(e) => {
                    // Prevent folder click when clicking action buttons
                    if ((e.target as HTMLElement).closest('button')) return
                    handleFolderClick(folder.id)
                  }}
                  className="cursor-pointer"
                >
                  <FolderItem
                    folder={folder}
                    onRefresh={handleRefreshFolder}
                    onRemove={handleRemoveFolder}
                    isScanning={isScanning}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* All tracks */}
          <AllTracksSection />
        </div>
      )}
    </div>
  )
}
