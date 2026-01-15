import { useEffect, useCallback, useRef } from 'react'
import { usePlayerStore } from '@renderer/stores/player-store'
import { useUIStore } from '@renderer/stores/ui-store'
import { useLibraryStore } from '@renderer/stores/library-store'

/**
 * Constants for keyboard shortcuts
 */
const SEEK_STEP = 5 // seconds
const VOLUME_STEP = 0.05 // 5% volume change

/**
 * Check if the current platform is macOS
 */
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

/**
 * Check if the modifier key is pressed (Cmd on Mac, Ctrl on others)
 */
function hasModifier(event: KeyboardEvent): boolean {
  return isMac ? event.metaKey : event.ctrlKey
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

export interface UseKeyboardShortcutsOptions {
  /** Reference to the search input element for focus */
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  /** Whether keyboard shortcuts are enabled */
  enabled?: boolean
}

/**
 * useKeyboardShortcuts hook
 *
 * Implements global keyboard shortcuts for the music player:
 * - Space: Toggle play/pause
 * - Left Arrow: Seek backward 5 seconds
 * - Right Arrow: Seek forward 5 seconds
 * - Up Arrow: Increase volume
 * - Down Arrow: Decrease volume
 * - Ctrl/Cmd + F: Focus search
 * - Ctrl/Cmd + N: Create new playlist
 * - Ctrl/Cmd + O: Add folder
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}): void {
  const { searchInputRef, enabled = true } = options

  // Store refs to avoid stale closures
  const searchInputRefInternal = useRef(searchInputRef)

  // Update ref in effect to avoid accessing during render
  useEffect(() => {
    searchInputRefInternal.current = searchInputRef
  }, [searchInputRef])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const target = event.target
      const isInput = isInputElement(target)
      const modifier = hasModifier(event)

      // Handle modifier key combinations (work even in input fields)
      if (modifier) {
        switch (event.key.toLowerCase()) {
          case 'f': {
            // Ctrl/Cmd + F: Focus search
            event.preventDefault()
            const searchInput = searchInputRefInternal.current?.current
            if (searchInput) {
              searchInput.focus()
              searchInput.select()
            }
            return
          }
          case 'n': {
            // Ctrl/Cmd + N: Create new playlist
            event.preventDefault()
            useUIStore.getState().openCreatePlaylistDialog()
            return
          }
          case 'o': {
            // Ctrl/Cmd + O: Add folder
            event.preventDefault()
            useLibraryStore.getState().addFolder()
            return
          }
        }
      }

      // Don't handle non-modifier shortcuts when in input fields
      if (isInput) return

      // Handle non-modifier shortcuts
      switch (event.key) {
        case ' ': {
          // Space: Toggle play/pause
          event.preventDefault()
          const playerState = usePlayerStore.getState()
          if (playerState.isPlaying) {
            playerState.pause()
          } else {
            playerState.play()
          }
          break
        }
        case 'ArrowLeft': {
          // Left Arrow: Seek backward 5 seconds
          event.preventDefault()
          const playerState = usePlayerStore.getState()
          const newPosition = Math.max(0, playerState.position - SEEK_STEP)
          playerState.seek(newPosition)
          break
        }
        case 'ArrowRight': {
          // Right Arrow: Seek forward 5 seconds
          event.preventDefault()
          const playerState = usePlayerStore.getState()
          const newPosition = Math.min(playerState.duration, playerState.position + SEEK_STEP)
          playerState.seek(newPosition)
          break
        }
        case 'ArrowUp': {
          // Up Arrow: Increase volume
          event.preventDefault()
          const playerState = usePlayerStore.getState()
          const newVolume = Math.min(1, playerState.volume + VOLUME_STEP)
          playerState.setVolume(newVolume)
          break
        }
        case 'ArrowDown': {
          // Down Arrow: Decrease volume
          event.preventDefault()
          const playerState = usePlayerStore.getState()
          const newVolume = Math.max(0, playerState.volume - VOLUME_STEP)
          playerState.setVolume(newVolume)
          break
        }
      }
    },
    [enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}
