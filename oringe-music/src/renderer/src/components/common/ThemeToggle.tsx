import * as React from 'react'
import { useTheme } from '@renderer/hooks/useTheme'
import type { ThemeType } from '@renderer/stores/ui-store'

interface ThemeToggleProps {
  collapsed?: boolean
}

const themeIcons: Record<ThemeType, React.ReactNode> = {
  light: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  dark: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  system: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

const themeLabels: Record<ThemeType, string> = {
  light: '亮色主题',
  dark: '暗色主题',
  system: '跟随系统'
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps): React.JSX.Element {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100 ${
        collapsed ? 'justify-center' : 'justify-start gap-3'
      }`}
      title={collapsed ? themeLabels[theme] : undefined}
    >
      <span className="flex-shrink-0">{themeIcons[theme]}</span>
      {!collapsed && <span className="truncate">{themeLabels[theme]}</span>}
    </button>
  )
}
