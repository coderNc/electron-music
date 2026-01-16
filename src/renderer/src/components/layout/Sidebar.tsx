import * as React from 'react'
import { useUIStore, type ViewType } from '@renderer/stores/ui-store'
import { useLibraryStore } from '@renderer/stores/library-store'
import { ThemeToggle } from '@renderer/components/common'
import { ScanProgressCompact } from '@renderer/components/library/ScanProgress'

interface NavItem {
  id: ViewType
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    id: 'library',
    label: '音乐库',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    )
  },
  {
    id: 'playlists',
    label: '播放列表',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    )
  },
  {
    id: 'albums',
    label: '专辑',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    )
  },
  {
    id: 'artists',
    label: '艺术家',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    )
  },
  {
    id: 'queue',
    label: '播放队列',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    )
  }
]

export function Sidebar(): React.JSX.Element {
  const currentView = useUIStore((state) => state.currentView)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const setCurrentView = useUIStore((state) => state.setCurrentView)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const toggleQueue = useUIStore((state) => state.toggleQueue)

  // Get scanning state from library store
  const isScanning = useLibraryStore((state) => state.isScanning)
  const scanProgress = useLibraryStore((state) => state.scanProgress)

  const handleNavClick = (item: NavItem): void => {
    if (item.id === 'queue') {
      toggleQueue()
    } else {
      setCurrentView(item.id)
    }
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-10 flex h-[calc(100vh-80px)] flex-col border-r border-zinc-200 bg-white transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo / App title */}
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        {!sidebarCollapsed && (
          <h1 className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-100">
            音乐播放器
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${
            sidebarCollapsed ? 'mx-auto' : 'ml-auto'
          }`}
          title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Scan progress indicator */}
        {isScanning && (
          <div className={`mb-3 px-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            {sidebarCollapsed ? (
              <div
                className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-green-500"
                title={`扫描中: ${scanProgress.current}/${scanProgress.total}`}
              />
            ) : (
              <ScanProgressCompact current={scanProgress.current} total={scanProgress.total} />
            )}
          </div>
        )}
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = item.id === currentView
            const isQueueItem = item.id === 'queue'

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive && !isQueueItem
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
                  } ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section - theme toggle and version */}
      <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <ThemeToggle collapsed={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">本地音乐播放器 v1.0</p>
        )}
      </div>
    </aside>
  )
}
