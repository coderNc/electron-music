/**
 * Debounce Utility
 *
 * Provides optimized debounce functionality for search and other
 * frequently triggered operations.
 *
 * Requirements: 10.4 - Smooth scrolling and responsive UI
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last call.
 *
 * @param fn - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  wait: number
): {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>): void => {
    lastArgs = args

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      if (lastArgs) {
        fn(...(lastArgs as Parameters<T>))
        lastArgs = null
      }
    }, wait)
  }

  debounced.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = null
  }

  debounced.flush = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (lastArgs) {
      fn(...(lastArgs as Parameters<T>))
      lastArgs = null
    }
  }

  return debounced
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per specified time period.
 *
 * @param fn - The function to throttle
 * @param wait - The number of milliseconds to throttle
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  wait: number
): {
  (...args: Parameters<T>): void
  cancel: () => void
} {
  let lastTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const throttled = (...args: Parameters<T>): void => {
    const now = Date.now()
    const remaining = wait - (now - lastTime)

    lastArgs = args

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      fn(...(args as Parameters<T>))
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        if (lastArgs) {
          fn(...(lastArgs as Parameters<T>))
          lastArgs = null
        }
      }, remaining)
    }
  }

  throttled.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = null
  }

  return throttled
}
