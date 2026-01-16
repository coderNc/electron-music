import * as React from 'react'

export interface ScanProgressProps {
  /** Current number of files processed */
  current: number
  /** Total number of files to process */
  total: number
  /** Currently processing file path */
  currentFile?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Scanning progress indicator component
 *
 * Displays a progress bar with file count and current file being processed.
 * Used during folder scanning to show progress without blocking the UI.
 *
 * Requirements: 1.6, 10.2
 */
export function ScanProgress({
  current,
  total,
  currentFile,
  className = ''
}: ScanProgressProps): React.JSX.Element {
  const progress = total > 0 ? (current / total) * 100 : 0
  const isComplete = current === total && total > 0

  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isComplete && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-green-500" />
          )}
          <span className="text-sm font-medium text-zinc-100">
            {isComplete ? '扫描完成' : '正在扫描...'}
          </span>
        </div>
        <span className="text-sm text-zinc-400">
          {current} / {total} 个文件
        </span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-green-500/80'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {currentFile && !isComplete && (
        <p className="truncate text-xs text-zinc-500" title={currentFile}>
          {getFileName(currentFile)}
        </p>
      )}
    </div>
  )
}

/**
 * Extracts the filename from a full path
 */
function getFileName(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || filePath
}

/**
 * Compact scan progress indicator for use in headers or sidebars
 */
export function ScanProgressCompact({
  current,
  total
}: Pick<ScanProgressProps, 'current' | 'total'>): React.JSX.Element {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-green-500" />
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400">
          {current}/{total}
        </span>
      </div>
    </div>
  )
}
