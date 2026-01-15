import * as React from 'react'
import { useLibraryStore } from '@renderer/stores/library-store'
import { debounce } from '@renderer/utils'

/**
 * Search icon
 */
const SearchIcon = React.memo(function SearchIcon(): React.JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
})

/**
 * Clear icon
 */
const ClearIcon = React.memo(function ClearIcon(): React.JSX.Element {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
})

export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Reference to the input element for focus control */
  inputRef?: React.RefObject<HTMLInputElement | null>
}

/**
 * SearchBar component
 *
 * Search input with debounced search functionality.
 * Connects to Library Store for search state management.
 *
 * Requirements: 5.1, 5.3
 */
export function SearchBar({
  placeholder = '搜索歌曲、艺术家、专辑...',
  className = '',
  debounceMs = 300,
  inputRef
}: SearchBarProps): React.JSX.Element {
  const searchQuery = useLibraryStore((state) => state.searchQuery)
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery)
  const clearSearch = useLibraryStore((state) => state.clearSearch)

  const [localValue, setLocalValue] = React.useState(searchQuery)
  const internalInputRef = React.useRef<HTMLInputElement>(null)

  // Use provided ref or internal ref
  const actualInputRef = inputRef || internalInputRef

  // Create debounced search function
  const debouncedSetSearch = React.useMemo(
    () => debounce((value: string) => setSearchQuery(value), debounceMs),
    [setSearchQuery, debounceMs]
  )

  // Sync local value with store when store changes externally
  React.useEffect(() => {
    setLocalValue(searchQuery)
  }, [searchQuery])

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      debouncedSetSearch.cancel()
    }
  }, [debouncedSetSearch])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    setLocalValue(value)
    debouncedSetSearch(value)
  }

  const handleClear = (): void => {
    setLocalValue('')
    debouncedSetSearch.cancel()
    clearSearch()
    actualInputRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-zinc-500">
          <SearchIcon />
        </span>
      </div>

      {/* Input */}
      <input
        ref={actualInputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        aria-label="搜索"
      />

      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
          aria-label="清除搜索"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  )
}
