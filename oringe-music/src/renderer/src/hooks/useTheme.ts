import * as React from 'react'
import { useUIStore, type ThemeType } from '@renderer/stores/ui-store'

/**
 * Hook for managing theme (light/dark/system)
 * Handles system theme detection and applies the appropriate class to the document
 */
export function useTheme(): {
  theme: ThemeType
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
} {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('dark')

  // Detect system theme preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent | MediaQueryList): void => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Resolve the actual theme to apply
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  // Apply theme class to document
  React.useEffect(() => {
    const root = document.documentElement

    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  // Toggle between themes: light -> dark -> system -> light
  const toggleTheme = React.useCallback(() => {
    const themeOrder: ThemeType[] = ['light', 'dark', 'system']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }, [theme, setTheme])

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  }
}
