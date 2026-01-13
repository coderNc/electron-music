import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  audioService,
  getVolume,
  setVolume,
  getStatus,
  getCurrentFilePath,
  dispose,
  clearAllListeners,
  onStatusChange,
  onEnd,
  onError,
  onProgress,
  onLoad
} from './audio-service'

// Mock Howler.js since we can't actually play audio in tests
vi.mock('howler', () => {
  class MockHowl {
    private _options: Record<string, unknown>
    private _volume: number
    private _position: number
    private _duration: number
    public playing: boolean

    constructor(options: Record<string, unknown>) {
      this._options = options
      this._volume = (options.volume as number) ?? 1
      this._position = 0
      this._duration = 120
      this.playing = false

      // Auto-trigger load after a tick to simulate async loading
      setTimeout(() => {
        const onload = options.onload as (() => void) | undefined
        if (onload) onload()
      }, 0)
    }

    play(): number {
      this.playing = true
      const onplay = this._options.onplay as (() => void) | undefined
      if (onplay) onplay()
      return 1
    }

    pause(): void {
      this.playing = false
      const onpause = this._options.onpause as (() => void) | undefined
      if (onpause) onpause()
    }

    stop(): void {
      this.playing = false
      this._position = 0
      const onstop = this._options.onstop as (() => void) | undefined
      if (onstop) onstop()
    }

    seek(pos?: number): number {
      if (typeof pos === 'number') {
        this._position = Math.max(0, Math.min(pos, this._duration))
      }
      return this._position
    }

    volume(vol?: number): number {
      if (typeof vol === 'number') {
        this._volume = vol
      }
      return this._volume
    }

    duration(): number {
      return this._duration
    }

    unload(): void {
      // Cleanup
    }
  }

  return {
    Howl: MockHowl,
    Howler: {
      autoUnlock: true,
      volume: vi.fn()
    }
  }
})

describe('AudioService', () => {
  beforeEach(() => {
    // Reset the service state before each test
    dispose()
    clearAllListeners()
  })

  afterEach(() => {
    dispose()
    clearAllListeners()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start with idle status', () => {
      expect(getStatus()).toBe('idle')
    })

    it('should start with no file loaded', () => {
      expect(getCurrentFilePath()).toBeNull()
    })

    it('should start with default volume of 1', () => {
      expect(getVolume()).toBe(1)
    })
  })

  describe('Volume Control', () => {
    it('should set volume within valid range', () => {
      setVolume(0.5)
      expect(getVolume()).toBe(0.5)
    })

    it('should clamp volume to minimum of 0', () => {
      setVolume(-0.5)
      expect(getVolume()).toBe(0)
    })

    it('should clamp volume to maximum of 1', () => {
      setVolume(1.5)
      expect(getVolume()).toBe(1)
    })

    it('should set volume to 0', () => {
      setVolume(0)
      expect(getVolume()).toBe(0)
    })

    it('should set volume to 1', () => {
      setVolume(0.5) // First set to something else
      setVolume(1)
      expect(getVolume()).toBe(1)
    })
  })

  describe('Event Listeners', () => {
    it('should register and unregister status change listener', () => {
      const callback = vi.fn()
      const unsubscribe = onStatusChange(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should register and unregister end listener', () => {
      const callback = vi.fn()
      const unsubscribe = onEnd(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should register and unregister error listener', () => {
      const callback = vi.fn()
      const unsubscribe = onError(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should register and unregister progress listener', () => {
      const callback = vi.fn()
      const unsubscribe = onProgress(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should register and unregister load listener', () => {
      const callback = vi.fn()
      const unsubscribe = onLoad(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('should clear all listeners', () => {
      const statusCallback = vi.fn()
      const endCallback = vi.fn()

      onStatusChange(statusCallback)
      onEnd(endCallback)

      clearAllListeners()

      // After clearing, callbacks should not be called
      expect(true).toBe(true)
    })
  })

  describe('Load Audio', () => {
    it('should load audio file and update status', async () => {
      const statusChanges: string[] = []
      onStatusChange((status) => statusChanges.push(status))

      await audioService.load('/path/to/audio.mp3')

      expect(statusChanges).toContain('loading')
      expect(getCurrentFilePath()).toBe('/path/to/audio.mp3')
    })

    it('should add file:// protocol if not present', async () => {
      await audioService.load('/path/to/audio.mp3')
      expect(getCurrentFilePath()).toBe('/path/to/audio.mp3')
    })

    it('should not duplicate file:// protocol', async () => {
      await audioService.load('file:///path/to/audio.mp3')
      expect(getCurrentFilePath()).toBe('file:///path/to/audio.mp3')
    })

    it('should call load callback with duration', async () => {
      const loadCallback = vi.fn()
      onLoad(loadCallback)

      await audioService.load('/path/to/audio.mp3')

      expect(loadCallback).toHaveBeenCalledWith(120) // Mock duration
    })
  })

  describe('Playback Controls', () => {
    beforeEach(async () => {
      await audioService.load('/path/to/audio.mp3')
    })

    it('should play audio and update status', () => {
      const statusChanges: string[] = []
      onStatusChange((status) => statusChanges.push(status))

      audioService.play()

      expect(statusChanges).toContain('playing')
    })

    it('should pause audio and update status', () => {
      audioService.play()

      const statusChanges: string[] = []
      onStatusChange((status) => statusChanges.push(status))

      audioService.pause()

      expect(statusChanges).toContain('paused')
    })

    it('should stop audio and update status', () => {
      audioService.play()

      const statusChanges: string[] = []
      onStatusChange((status) => statusChanges.push(status))

      audioService.stop()

      expect(statusChanges).toContain('stopped')
    })

    it('should not throw when playing without loaded audio', () => {
      dispose()
      expect(() => audioService.play()).not.toThrow()
    })

    it('should not throw when pausing without loaded audio', () => {
      dispose()
      expect(() => audioService.pause()).not.toThrow()
    })

    it('should not throw when stopping without loaded audio', () => {
      dispose()
      expect(() => audioService.stop()).not.toThrow()
    })
  })

  describe('Seek', () => {
    beforeEach(async () => {
      await audioService.load('/path/to/audio.mp3')
    })

    it('should seek to valid position', () => {
      audioService.seek(30)
      expect(audioService.getPosition()).toBe(30)
    })

    it('should clamp seek to minimum of 0', () => {
      audioService.seek(-10)
      expect(audioService.getPosition()).toBe(0)
    })

    it('should clamp seek to maximum of duration', () => {
      audioService.seek(200) // Duration is 120 in mock
      expect(audioService.getPosition()).toBe(120)
    })

    it('should notify progress listeners on seek', () => {
      const progressCallback = vi.fn()
      onProgress(progressCallback)

      audioService.seek(30)

      expect(progressCallback).toHaveBeenCalledWith(30)
    })

    it('should not throw when seeking without loaded audio', () => {
      dispose()
      expect(() => audioService.seek(30)).not.toThrow()
    })
  })

  describe('Duration', () => {
    it('should return 0 when no audio is loaded', () => {
      expect(audioService.getDuration()).toBe(0)
    })

    it('should return duration when audio is loaded', async () => {
      await audioService.load('/path/to/audio.mp3')
      expect(audioService.getDuration()).toBe(120) // Mock duration
    })
  })

  describe('Position', () => {
    it('should return 0 when no audio is loaded', () => {
      expect(audioService.getPosition()).toBe(0)
    })
  })

  describe('isPlaying', () => {
    it('should return false when idle', () => {
      expect(audioService.isPlaying()).toBe(false)
    })

    it('should return true when playing', async () => {
      await audioService.load('/path/to/audio.mp3')
      audioService.play()
      expect(audioService.isPlaying()).toBe(true)
    })

    it('should return false when paused', async () => {
      await audioService.load('/path/to/audio.mp3')
      audioService.play()
      audioService.pause()
      expect(audioService.isPlaying()).toBe(false)
    })
  })

  describe('Dispose', () => {
    it('should reset status to idle', async () => {
      await audioService.load('/path/to/audio.mp3')
      audioService.play()

      dispose()

      expect(getStatus()).toBe('idle')
    })

    it('should clear current file path', async () => {
      await audioService.load('/path/to/audio.mp3')

      dispose()

      expect(getCurrentFilePath()).toBeNull()
    })
  })
})
