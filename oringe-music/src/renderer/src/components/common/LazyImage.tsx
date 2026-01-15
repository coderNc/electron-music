import * as React from 'react'

export interface LazyImageProps {
  /** Image source URL */
  src: string | undefined
  /** Alt text for the image */
  alt: string
  /** CSS classes for the image */
  className?: string
  /** Fallback component to show when no image or loading */
  fallback?: React.ReactNode
  /** Whether to show loading state */
  showLoading?: boolean
}

/**
 * LazyImage component
 *
 * Lazy loads images with intersection observer for better performance.
 * Shows fallback while loading or when image fails to load.
 *
 * Requirements: 10.3 - Async loading of cover images
 */
export function LazyImage({
  src,
  alt,
  className = '',
  fallback,
  showLoading = true
}: LazyImageProps): React.JSX.Element {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // Reset state when src changes
  React.useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  // Intersection observer for lazy loading
  React.useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0
      }
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleLoad = (): void => {
    setIsLoaded(true)
  }

  const handleError = (): void => {
    setHasError(true)
  }

  // Show fallback if no src, error, or not loaded yet
  if (!src || hasError) {
    return <>{fallback}</>
  }

  return (
    <div className={`relative ${className}`} ref={imgRef as React.RefObject<HTMLDivElement>}>
      {/* Show fallback while loading */}
      {showLoading && !isLoaded && <div className="absolute inset-0">{fallback}</div>}

      {/* Only load image when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}

/**
 * Default album art placeholder component
 */
export function DefaultAlbumArt({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}): React.JSX.Element {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'aspect-square w-full'
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div
      className={`flex items-center justify-center rounded bg-zinc-800 ${sizeClasses[size]} ${className}`}
    >
      <svg
        className={`text-zinc-600 ${iconSizes[size]}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    </div>
  )
}
