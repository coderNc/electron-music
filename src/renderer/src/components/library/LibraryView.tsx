import * as React from 'react'
import { useLibraryStore } from '@renderer/stores/library-store'
import { TrackList } from './TrackList'
import { SearchBar } from './SearchBar'
import { ScanProgress } from './ScanProgress'
import { useSearchInputRef } from '@renderer/contexts'
import type { FolderInfo } from '@shared/types'

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

interface FolderItemProps {
  folder: FolderInfo
  onRefresh: (folderId: string) => void
  onRemove: (folderId: string) => void
  isScanning: boolean
}

function FolderItem({
  folder,
  onRefresh,
  onRemove,
  isScanning
}: FolderItemProps): React.JSX.Element {
  return (
    <div className="surface-card group interactive-soft flex items-center justify-between rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <div className="glass-soft flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 dark:text-zinc-300">
          <FolderIcon />
        </div>
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{folder.name}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-200/90">{folder.trackCount} 首歌曲</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onRefresh(folder.id)}
          disabled={isScanning}
          className="interactive-soft focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-white/70 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          title="刷新文件夹"
        >
          <RefreshIcon />
        </button>
        <button
          onClick={() => onRemove(folder.id)}
          disabled={isScanning}
          className="interactive-soft focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-white/70 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-red-400"
          title="移除文件夹"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onAddFolder }: { onAddFolder: () => void }): React.JSX.Element {
  return (
    <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-16 text-center stage-gradient">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400/85 to-orange-600 text-white shadow-xl">
        <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">音乐库为空</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-600 dark:text-zinc-300">
        添加包含音乐文件的文件夹来开始使用。支持 MP3、FLAC、WAV、AAC、OGG 等格式。
      </p>
      <button
        onClick={onAddFolder}
        className="interactive-soft focus-ring rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
      >
        <span className="inline-flex items-center gap-2">
          <AddFolderIcon />
          添加文件夹
        </span>
      </button>
    </div>
  )
}

export interface LibraryViewProps {
  onSelectFolder?: (folderId: string) => void
}

function AllTracksSection(): React.JSX.Element {
  const tracks = useLibraryStore((state) => state.tracks)
  const getFilteredTracks = useLibraryStore((state) => state.getFilteredTracks)
  const searchQuery = useLibraryStore((state) => state.searchQuery)

  const displayTracks = searchQuery ? getFilteredTracks() : tracks

  if (tracks.length === 0) {
    return <></>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-200/90">
        所有歌曲 ({displayTracks.length})
        {searchQuery && displayTracks.length !== tracks.length && (
          <span className="ml-2 text-zinc-500">(共 {tracks.length} 首)</span>
        )}
      </h3>
      <TrackList tracks={displayTracks} />
    </div>
  )
}

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

  const handleFolderClick = (folderId: string): void => {
    if (onSelectFolder) onSelectFolder(folderId)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          音乐库
        </h2>
        <div className="flex items-center gap-3">
          <SearchBar className="w-64" inputRef={searchInputRef ?? undefined} />
          <button
            onClick={() => addFolder()}
            disabled={isScanning}
            className="interactive-soft focus-ring rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <AddFolderIcon />
              添加文件夹
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="surface-card flex items-center justify-between rounded-xl border border-red-200/70 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="focus-ring rounded px-2 text-sm text-red-700 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            关闭
          </button>
        </div>
      )}

      {isScanning && (
        <ScanProgress
          current={scanProgress.current}
          total={scanProgress.total}
          currentFile={scanProgress.currentFile}
        />
      )}

      {folders.length === 0 && !isScanning ? (
        <EmptyState onAddFolder={() => addFolder()} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              文件夹 ({folders.length})
            </h3>
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return
                    handleFolderClick(folder.id)
                  }}
                  className="cursor-pointer"
                >
                  <FolderItem
                    folder={folder}
                    onRefresh={refreshFolder}
                    onRemove={removeFolder}
                    isScanning={isScanning}
                  />
                </div>
              ))}
            </div>
          </div>

          <AllTracksSection />
        </div>
      )}
    </div>
  )
}
