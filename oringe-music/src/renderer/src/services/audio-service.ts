import { Howl, Howler } from 'howler'

/**
 * Audio playback error class
 */
export class AudioServiceError extends Error {
  code: string
  filePath?: string

  constructor(message: string, code: string, filePath?: string) {
    super(message)
    this.name = 'AudioServiceError'
    this.code = code
    this.filePath = filePath
  }
}

/**
 * Audio playback state
 */
export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error'

/**
 * Event callback types
 */
export type EndCallback = () => void
export type ErrorCallback = (error: AudioServiceError) => void
export type ProgressCallback = (position: number) => void
export type StatusChangeCallback = (status: PlaybackStatus) => void
export type LoadCallback = (duration: number) => void

/**
 * Audio Service - Wraps Howler.js for audio playback
 *
 * Provides a clean interface for:
 * - Loading and playing audio files
 * - Playback controls (play, pause, stop, seek)
 * - Volume control
 * - Progress tracking
 * - Event handling (end, error, progress)
 */
class AudioServiceImpl {
  private howl: Howl | null = null
  private currentFilePath: string | null = null
  private status: PlaybackStatus = 'idle'
  private progressInterval: ReturnType<typeof setInterval> | null = null
  private volume: number = 1

  // Event callbacks
  private endCallbacks: Set<EndCallback> = new Set()
  private errorCallbacks: Set<ErrorCallback> = new Set()
  private progressCallbacks: Set<ProgressCallback> = new Set()
  private statusChangeCallbacks: Set<StatusChangeCallback> = new Set()
  private loadCallbacks: Set<LoadCallback> = new Set()

  constructor() {
    // Initialize global Howler settings
    Howler.autoUnlock = true
  }

  /**
   * Gets the current playback status
   */
  getStatus(): PlaybackStatus {
    return this.status
  }

  /**
   * Gets the currently loaded file path
   */
  getCurrentFilePath(): string | null {
    return this.currentFilePath
  }

  /**
   * Sets the playback status and notifies listeners
   */
  private setStatus(newStatus: PlaybackStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.statusChangeCallbacks.forEach((cb) => cb(newStatus))
    }
  }

  /**
   * Starts the progress tracking interval
   */
  private startProgressTracking(): void {
    this.stopProgressTracking()
    this.progressInterval = setInterval(() => {
      if (this.howl && this.status === 'playing') {
        const position = this.howl.seek() as number
        this.progressCallbacks.forEach((cb) => cb(position))
      }
    }, 250) // Update every 250ms for smooth progress
  }

  /**
   * Stops the progress tracking interval
   */
  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }

  /**
   * Loads an audio file for playback
   * @param filePath - Path to the audio file (file:// protocol will be added if needed)
   * @returns Promise that resolves when the file is loaded
   */
  load(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Clean up existing howl
      this.dispose()

      this.setStatus('loading')
      this.currentFilePath = filePath

      // Ensure file:// protocol for local files
      const src = filePath.startsWith('file://') ? filePath : `file://${filePath}`

      this.howl = new Howl({
        src: [src],
        html5: true, // Use HTML5 Audio for streaming large files
        volume: this.volume,
        onload: () => {
          this.setStatus('stopped')
          const duration = this.howl?.duration() ?? 0
          this.loadCallbacks.forEach((cb) => cb(duration))
          resolve()
        },
        onloaderror: (_id, error) => {
          const audioError = new AudioServiceError(
            `Failed to load audio file: ${error}`,
            'LOAD_ERROR',
            filePath
          )
          this.setStatus('error')
          this.errorCallbacks.forEach((cb) => cb(audioError))
          reject(audioError)
        },
        onplay: () => {
          this.setStatus('playing')
          this.startProgressTracking()
        },
        onpause: () => {
          this.setStatus('paused')
          this.stopProgressTracking()
        },
        onstop: () => {
          this.setStatus('stopped')
          this.stopProgressTracking()
        },
        onend: () => {
          this.setStatus('stopped')
          this.stopProgressTracking()
          this.endCallbacks.forEach((cb) => cb())
        },
        onplayerror: (_id, error) => {
          const audioError = new AudioServiceError(
            `Playback error: ${error}`,
            'PLAYBACK_ERROR',
            filePath
          )
          this.setStatus('error')
          this.stopProgressTracking()
          this.errorCallbacks.forEach((cb) => cb(audioError))
        }
      })
    })
  }

  /**
   * Starts or resumes playback
   */
  play(): void {
    if (!this.howl) {
      return
    }
    this.howl.play()
  }

  /**
   * Pauses playback, maintaining current position
   */
  pause(): void {
    if (!this.howl) {
      return
    }
    this.howl.pause()
  }

  /**
   * Stops playback and resets position to beginning
   */
  stop(): void {
    if (!this.howl) {
      return
    }
    this.howl.stop()
  }

  /**
   * Seeks to a specific position in the audio
   * @param position - Position in seconds
   */
  seek(position: number): void {
    if (!this.howl) {
      return
    }
    // Clamp position to valid range
    const duration = this.howl.duration()
    const clampedPosition = Math.max(0, Math.min(position, duration))
    this.howl.seek(clampedPosition)

    // Notify progress listeners of the new position
    this.progressCallbacks.forEach((cb) => cb(clampedPosition))
  }

  /**
   * Gets the current playback position in seconds
   * @returns Current position in seconds, or 0 if no audio is loaded
   */
  getPosition(): number {
    if (!this.howl) {
      return 0
    }
    const pos = this.howl.seek()
    return typeof pos === 'number' ? pos : 0
  }

  /**
   * Sets the playback volume
   * @param volume - Volume level from 0 to 1
   */
  setVolume(volume: number): void {
    // Clamp volume to valid range
    this.volume = Math.max(0, Math.min(1, volume))

    if (this.howl) {
      this.howl.volume(this.volume)
    }

    // Also set global Howler volume
    Howler.volume(this.volume)
  }

  /**
   * Gets the current volume level
   * @returns Volume level from 0 to 1
   */
  getVolume(): number {
    return this.volume
  }

  /**
   * Gets the duration of the currently loaded audio
   * @returns Duration in seconds, or 0 if no audio is loaded
   */
  getDuration(): number {
    if (!this.howl) {
      return 0
    }
    return this.howl.duration()
  }

  /**
   * Checks if audio is currently playing
   * @returns True if audio is playing
   */
  isPlaying(): boolean {
    return this.status === 'playing'
  }

  /**
   * Registers a callback for when playback ends
   * @param callback - Function to call when playback ends
   * @returns Unsubscribe function
   */
  onEnd(callback: EndCallback): () => void {
    this.endCallbacks.add(callback)
    return () => this.endCallbacks.delete(callback)
  }

  /**
   * Registers a callback for playback errors
   * @param callback - Function to call on error
   * @returns Unsubscribe function
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback)
    return () => this.errorCallbacks.delete(callback)
  }

  /**
   * Registers a callback for progress updates
   * @param callback - Function to call with current position
   * @returns Unsubscribe function
   */
  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback)
    return () => this.progressCallbacks.delete(callback)
  }

  /**
   * Registers a callback for status changes
   * @param callback - Function to call when status changes
   * @returns Unsubscribe function
   */
  onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusChangeCallbacks.add(callback)
    return () => this.statusChangeCallbacks.delete(callback)
  }

  /**
   * Registers a callback for when audio is loaded
   * @param callback - Function to call with duration when loaded
   * @returns Unsubscribe function
   */
  onLoad(callback: LoadCallback): () => void {
    this.loadCallbacks.add(callback)
    return () => this.loadCallbacks.delete(callback)
  }

  /**
   * Cleans up resources and stops playback
   */
  dispose(): void {
    this.stopProgressTracking()

    if (this.howl) {
      this.howl.unload()
      this.howl = null
    }

    this.currentFilePath = null
    this.setStatus('idle')
  }

  /**
   * Clears all event listeners
   */
  clearAllListeners(): void {
    this.endCallbacks.clear()
    this.errorCallbacks.clear()
    this.progressCallbacks.clear()
    this.statusChangeCallbacks.clear()
    this.loadCallbacks.clear()
  }
}

// Export singleton instance
export const audioService = new AudioServiceImpl()

// Export individual functions for convenience
export const load = (filePath: string): Promise<void> => audioService.load(filePath)
export const play = (): void => audioService.play()
export const pause = (): void => audioService.pause()
export const stop = (): void => audioService.stop()
export const seek = (position: number): void => audioService.seek(position)
export const getPosition = (): number => audioService.getPosition()
export const setVolume = (volume: number): void => audioService.setVolume(volume)
export const getVolume = (): number => audioService.getVolume()
export const getDuration = (): number => audioService.getDuration()
export const isPlaying = (): boolean => audioService.isPlaying()
export const getStatus = (): PlaybackStatus => audioService.getStatus()
export const getCurrentFilePath = (): string | null => audioService.getCurrentFilePath()
export const onEnd = (callback: EndCallback): (() => void) => audioService.onEnd(callback)
export const onError = (callback: ErrorCallback): (() => void) => audioService.onError(callback)
export const onProgress = (callback: ProgressCallback): (() => void) =>
  audioService.onProgress(callback)
export const onStatusChange = (callback: StatusChangeCallback): (() => void) =>
  audioService.onStatusChange(callback)
export const onLoad = (callback: LoadCallback): (() => void) => audioService.onLoad(callback)
export const dispose = (): void => audioService.dispose()
export const clearAllListeners = (): void => audioService.clearAllListeners()

// Export interface for type safety
export interface AudioService {
  load: typeof load
  play: typeof play
  pause: typeof pause
  stop: typeof stop
  seek: typeof seek
  getPosition: typeof getPosition
  setVolume: typeof setVolume
  getVolume: typeof getVolume
  getDuration: typeof getDuration
  isPlaying: typeof isPlaying
  getStatus: typeof getStatus
  getCurrentFilePath: typeof getCurrentFilePath
  onEnd: typeof onEnd
  onError: typeof onError
  onProgress: typeof onProgress
  onStatusChange: typeof onStatusChange
  onLoad: typeof onLoad
  dispose: typeof dispose
  clearAllListeners: typeof clearAllListeners
}
