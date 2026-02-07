import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'

export type ViewType = 'library' | 'playlists' | 'albums' | 'artists' | 'queue' | 'netease'
export type ThemeType = 'light' | 'dark' | 'system'

export interface UIState {
  // Navigation
  currentView: ViewType
  previousView: ViewType | null

  // Sidebar
  sidebarCollapsed: boolean

  // Queue panel
  queueVisible: boolean

  // Lyrics panel
  lyricsVisible: boolean

  // Theme
  theme: ThemeType

  // Dialogs
  createPlaylistDialogOpen: boolean
  addFolderDialogOpen: boolean

  // Context menu
  contextMenuPosition: { x: number; y: number } | null
  contextMenuData: unknown | null
}

export interface UIActions {
  // Navigation
  setCurrentView: (view: ViewType) => void
  goBack: () => void

  // Sidebar
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Queue panel
  toggleQueue: () => void
  setQueueVisible: (visible: boolean) => void

  // Lyrics panel
  toggleLyrics: () => void
  setLyricsVisible: (visible: boolean) => void

  // Theme
  setTheme: (theme: ThemeType) => void

  // Dialogs
  openCreatePlaylistDialog: () => void
  closeCreatePlaylistDialog: () => void
  openAddFolderDialog: () => void
  closeAddFolderDialog: () => void

  // Context menu
  openContextMenu: (x: number, y: number, data: unknown) => void
  closeContextMenu: () => void
}

export type UIStore = UIState & UIActions

const initialState: UIState = {
  currentView: 'library',
  previousView: null,
  sidebarCollapsed: false,
  queueVisible: false,
  lyricsVisible: false,
  theme: 'system',
  createPlaylistDialogOpen: false,
  addFolderDialogOpen: false,
  contextMenuPosition: null,
  contextMenuData: null
}

export const useUIStore = create<UIStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        setCurrentView: (view: ViewType) => {
          const state = get()
          if (state.currentView !== view) {
            set({
              previousView: state.currentView,
              currentView: view
            })
          }
        },

        goBack: () => {
          const state = get()
          if (state.previousView) {
            set({
              currentView: state.previousView,
              previousView: null
            })
          }
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed })
        },

        toggleQueue: () => {
          set((state) => ({ queueVisible: !state.queueVisible }))
        },

        setQueueVisible: (visible: boolean) => {
          set({ queueVisible: visible })
        },

        toggleLyrics: () => {
          set((state) => ({ lyricsVisible: !state.lyricsVisible }))
        },

        setLyricsVisible: (visible: boolean) => {
          set({ lyricsVisible: visible })
        },

        setTheme: (theme: ThemeType) => {
          set({ theme })
        },

        openCreatePlaylistDialog: () => {
          set({ createPlaylistDialogOpen: true })
        },

        closeCreatePlaylistDialog: () => {
          set({ createPlaylistDialogOpen: false })
        },

        openAddFolderDialog: () => {
          set({ addFolderDialogOpen: true })
        },

        closeAddFolderDialog: () => {
          set({ addFolderDialogOpen: false })
        },

        openContextMenu: (x: number, y: number, data: unknown) => {
          set({
            contextMenuPosition: { x, y },
            contextMenuData: data
          })
        },

        closeContextMenu: () => {
          set({
            contextMenuPosition: null,
            contextMenuData: null
          })
        }
      }),
      {
        name: 'ui-store',
        // Only persist certain fields
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme
        })
      }
    )
  )
)

// Export selectors for convenience
export const selectCurrentView = (state: UIStore): ViewType => state.currentView
export const selectSidebarCollapsed = (state: UIStore): boolean => state.sidebarCollapsed
export const selectQueueVisible = (state: UIStore): boolean => state.queueVisible
export const selectLyricsVisible = (state: UIStore): boolean => state.lyricsVisible
export const selectTheme = (state: UIStore): ThemeType => state.theme
export const selectCreatePlaylistDialogOpen = (state: UIStore): boolean =>
  state.createPlaylistDialogOpen
export const selectAddFolderDialogOpen = (state: UIStore): boolean => state.addFolderDialogOpen
export const selectContextMenuPosition = (state: UIStore): { x: number; y: number } | null =>
  state.contextMenuPosition
export const selectContextMenuData = (state: UIStore): unknown | null => state.contextMenuData
