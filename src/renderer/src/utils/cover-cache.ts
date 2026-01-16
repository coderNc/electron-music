/**
 * Cover Image Cache
 *
 * Provides caching for album cover images to avoid redundant loading.
 * Uses an LRU (Least Recently Used) cache strategy with configurable size.
 *
 * Requirements: 10.3 - Async loading and caching of cover images
 */

interface CacheEntry {
  url: string
  lastAccessed: number
}

/**
 * LRU Cache for cover images
 */
class CoverCache {
  private cache: Map<string, CacheEntry>
  private maxSize: number
  private loadingPromises: Map<string, Promise<string | null>>

  constructor(maxSize = 200) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.loadingPromises = new Map()
  }

  /**
   * Gets a cached cover URL by track ID
   * Updates last accessed time for LRU tracking
   */
  get(trackId: string): string | null {
    const entry = this.cache.get(trackId)
    if (entry) {
      // Update last accessed time
      entry.lastAccessed = Date.now()
      return entry.url
    }
    return null
  }

  /**
   * Sets a cover URL in the cache
   * Evicts least recently used entries if cache is full
   */
  set(trackId: string, url: string): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(trackId, {
      url,
      lastAccessed: Date.now()
    })
  }

  /**
   * Checks if a cover is cached
   */
  has(trackId: string): boolean {
    return this.cache.has(trackId)
  }

  /**
   * Removes a cover from the cache
   */
  delete(trackId: string): void {
    this.cache.delete(trackId)
    this.loadingPromises.delete(trackId)
  }

  /**
   * Clears the entire cache
   */
  clear(): void {
    this.cache.clear()
    this.loadingPromises.clear()
  }

  /**
   * Gets the current cache size
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Evicts the least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Gets or loads a cover image with deduplication
   * Prevents multiple simultaneous loads for the same track
   */
  async getOrLoad(trackId: string, loader: () => Promise<string | null>): Promise<string | null> {
    // Check cache first
    const cached = this.get(trackId)
    if (cached) {
      return cached
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(trackId)
    if (existingPromise) {
      return existingPromise
    }

    // Start loading
    const loadPromise = loader()
      .then((url) => {
        this.loadingPromises.delete(trackId)
        if (url) {
          this.set(trackId, url)
        }
        return url
      })
      .catch((error) => {
        this.loadingPromises.delete(trackId)
        console.warn(`Failed to load cover for track ${trackId}:`, error)
        return null
      })

    this.loadingPromises.set(trackId, loadPromise)
    return loadPromise
  }

  /**
   * Preloads covers for a list of tracks
   * Useful for preloading visible items in a virtualized list
   */
  async preload(
    trackIds: string[],
    loader: (trackId: string) => Promise<string | null>
  ): Promise<void> {
    const uncached = trackIds.filter((id) => !this.has(id))
    await Promise.all(uncached.map((id) => this.getOrLoad(id, () => loader(id))))
  }
}

// Singleton instance
export const coverCache = new CoverCache(200)

// Export class for testing
export { CoverCache }
