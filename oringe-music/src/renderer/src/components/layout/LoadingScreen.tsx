import * as React from 'react'

interface LoadingScreenProps {
  message?: string
  error?: string | null
}

/**
 * Music icon SVG component
 */
function MusicIcon(): React.JSX.Element {
  return (
    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  )
}

/**
 * Loading screen component shown during app initialization
 * Implements Requirements 8.7
 */
export function LoadingScreen({ message, error }: LoadingScreenProps): React.JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      {/* Logo/Icon */}
      <div className="mb-8 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <MusicIcon />
          </div>
        </div>
      </div>

      {/* App name */}
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">音乐播放器</h1>

      {/* Loading indicator or error */}
      {error ? (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500 dark:border-zinc-700" />

          {/* Loading message */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{message || '正在加载...'}</p>
        </div>
      )}
    </div>
  )
}
