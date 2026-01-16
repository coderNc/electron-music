import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { usePlayerStore } from '@renderer/stores/player-store'
import { useUIStore } from '@renderer/stores/ui-store'
import { useLibraryStore } from '@renderer/stores/library-store'

// Mock the stores
vi.mock('@renderer/stores/player-store', () => ({
  usePlayerStore: {
    getState: vi.fn()
  }
}))

vi.mock('@renderer/stores/ui-store', () => ({
  useUIStore: {
    getState: vi.fn()
  }
}))

vi.mock('@renderer/stores/library-store', () => ({
  useLibraryStore: {
    getState: vi.fn()
  }
}))

// Check if running on Mac (for test environment)
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')

describe('useKeyboardShortcuts', () => {
  const mockPlayerState = {
    isPlaying: false,
    position: 30,
    duration: 180,
    volume: 0.5,
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn()
  }

  const mockUIState = {
    openCreatePlaylistDialog: vi.fn()
  }

  const mockLibraryState = {
    addFolder: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(usePlayerStore.getState as ReturnType<typeof vi.fn>).mockReturnValue(mockPlayerState)
    ;(useUIStore.getState as ReturnType<typeof vi.fn>).mockReturnValue(mockUIState)
    ;(useLibraryStore.getState as ReturnType<typeof vi.fn>).mockReturnValue(mockLibraryState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Helper to dispatch keyboard events with platform-aware modifier
   */
  function dispatchKeyEvent(
    key: string,
    options: { modifier?: boolean; target?: EventTarget } = {}
  ): void {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: options.modifier && !isMac,
      metaKey: options.modifier && isMac,
      bubbles: true,
      cancelable: true
    })

    if (options.target) {
      Object.defineProperty(event, 'target', { value: options.target })
    }

    window.dispatchEvent(event)
  }

  describe('Playback Controls', () => {
    it('should toggle play when space is pressed (Requirements 12.1)', () => {
      mockPlayerState.isPlaying = false
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent(' ')

      expect(mockPlayerState.play).toHaveBeenCalled()
    })

    it('should toggle pause when space is pressed while playing (Requirements 12.1)', () => {
      mockPlayerState.isPlaying = true
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent(' ')

      expect(mockPlayerState.pause).toHaveBeenCalled()
    })

    it('should not toggle play/pause when space is pressed in input field', () => {
      renderHook(() => useKeyboardShortcuts())

      const input = document.createElement('input')
      dispatchKeyEvent(' ', { target: input })

      expect(mockPlayerState.play).not.toHaveBeenCalled()
      expect(mockPlayerState.pause).not.toHaveBeenCalled()
    })
  })

  describe('Seek Controls', () => {
    it('should seek backward 5 seconds when left arrow is pressed (Requirements 12.2)', () => {
      mockPlayerState.position = 30
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowLeft')

      expect(mockPlayerState.seek).toHaveBeenCalledWith(25)
    })

    it('should not seek below 0 when left arrow is pressed', () => {
      mockPlayerState.position = 3
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowLeft')

      expect(mockPlayerState.seek).toHaveBeenCalledWith(0)
    })

    it('should seek forward 5 seconds when right arrow is pressed (Requirements 12.3)', () => {
      mockPlayerState.position = 30
      mockPlayerState.duration = 180
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowRight')

      expect(mockPlayerState.seek).toHaveBeenCalledWith(35)
    })

    it('should not seek beyond duration when right arrow is pressed', () => {
      mockPlayerState.position = 178
      mockPlayerState.duration = 180
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowRight')

      expect(mockPlayerState.seek).toHaveBeenCalledWith(180)
    })
  })

  describe('Volume Controls', () => {
    it('should increase volume when up arrow is pressed (Requirements 12.4)', () => {
      mockPlayerState.volume = 0.5
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowUp')

      expect(mockPlayerState.setVolume).toHaveBeenCalledWith(0.55)
    })

    it('should not increase volume above 1', () => {
      mockPlayerState.volume = 0.98
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowUp')

      expect(mockPlayerState.setVolume).toHaveBeenCalledWith(1)
    })

    it('should decrease volume when down arrow is pressed (Requirements 12.5)', () => {
      mockPlayerState.volume = 0.5
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowDown')

      expect(mockPlayerState.setVolume).toHaveBeenCalledWith(0.45)
    })

    it('should not decrease volume below 0', () => {
      mockPlayerState.volume = 0.02
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('ArrowDown')

      expect(mockPlayerState.setVolume).toHaveBeenCalledWith(0)
    })
  })

  describe('Search Shortcut', () => {
    it('should focus search input when modifier+F is pressed (Requirements 12.6)', () => {
      const inputRef = { current: document.createElement('input') }
      const focusSpy = vi.spyOn(inputRef.current, 'focus')
      const selectSpy = vi.spyOn(inputRef.current, 'select')

      renderHook(() => useKeyboardShortcuts({ searchInputRef: inputRef }))

      dispatchKeyEvent('f', { modifier: true })

      expect(focusSpy).toHaveBeenCalled()
      expect(selectSpy).toHaveBeenCalled()
    })
  })

  describe('Create Playlist Shortcut', () => {
    it('should open create playlist dialog when modifier+N is pressed (Requirements 12.7)', () => {
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('n', { modifier: true })

      expect(mockUIState.openCreatePlaylistDialog).toHaveBeenCalled()
    })
  })

  describe('Add Folder Shortcut', () => {
    it('should open add folder dialog when modifier+O is pressed (Requirements 12.8)', () => {
      renderHook(() => useKeyboardShortcuts())

      dispatchKeyEvent('o', { modifier: true })

      expect(mockLibraryState.addFolder).toHaveBeenCalled()
    })
  })

  describe('Enabled/Disabled State', () => {
    it('should not respond to shortcuts when disabled', () => {
      renderHook(() => useKeyboardShortcuts({ enabled: false }))

      dispatchKeyEvent(' ')

      expect(mockPlayerState.play).not.toHaveBeenCalled()
      expect(mockPlayerState.pause).not.toHaveBeenCalled()
    })
  })
})
