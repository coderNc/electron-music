import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'

export type ViewType = 'library' | 'playlists' | 'albums' | 'artists' | 'queue'
export type ThemeType = 'light' | 'dark' | 'system'

export interface UIState {
  // Navigation
  currentView: ViewType
  previousView: ViewType | null

  // Sidebar
  sidebarCollapsed: boolean

  // Queue panel
  queueVisible: boolean

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
export const selectCurrentView = (state: UIStore) => state.currentView
export const selectSidebarCollapsed = (state: UIStore) => state.sidebarCollapsed
export const selectQueueVisible = (state: UIStore) => state.queueVisible
export const selectTheme = (state: UIStore) => state.theme
export const selectCreatePlaylistDialogOpen = (state: UIStore) => state.createPlaylistDialogOpen
export const selectAddFolderDialogOpen = (state: UIStore) => state.addFolderDialogOpen
export const selectContextMenuPosition = (state: UIStore) => state.contextMenuPosition
export const selectContextMenuData = (state: UIStore) => state.contextMenuData
