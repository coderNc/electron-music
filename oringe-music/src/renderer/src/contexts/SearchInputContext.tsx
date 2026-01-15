import * as React from 'react'

// Create a context for the search input ref
export const SearchInputRefContext =
  React.createContext<React.RefObject<HTMLInputElement | null> | null>(null)

export function useSearchInputRef(): React.RefObject<HTMLInputElement | null> | null {
  return React.useContext(SearchInputRefContext)
}
