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
    id: 'netease',
    label: '网易云',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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

  const isScanning = useLibraryStore((state) => state.isScanning)
  const scanProgress = useLibraryStore((state) => state.scanProgress)

  const isMacOS = navigator.platform.toLowerCase().includes('mac')

  const handleNavClick = (item: NavItem): void => {
    if (item.id === 'queue') {
      toggleQueue()
      return
    }
    setCurrentView(item.id)
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-10 flex bottom-20 flex-col border-r transition-all duration-200 ${
        sidebarCollapsed ? 'w-24' : 'w-56'
      } ${isMacOS ? 'glass-soft border-white/20 dark:border-zinc-700/40' : 'surface-card border-zinc-200 dark:border-zinc-800'}`}
      style={isMacOS ? { paddingTop: '38px' } : undefined}
    >
      <div className="flex h-14 items-center border-b border-zinc-200/70 px-4 dark:border-zinc-700/60">
        {!sidebarCollapsed && (
          <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            橘子的晴天
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className={`interactive-soft focus-ring flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100 ${
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

      <nav className="flex-1 overflow-y-auto py-4">
        {isScanning && (
          <div className={`mb-3 px-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            {sidebarCollapsed ? (
              <div
                className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-orange-500"
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
                  data-active={isActive && !isQueueItem}
                  className={`nav-liquid interactive-soft focus-ring flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive && !isQueueItem
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
                  } ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span
                    className={`flex-shrink-0 transition-transform duration-150 ${isActive && !isQueueItem ? 'scale-105' : 'group-hover:scale-[1.02]'}`}
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-200/70 p-2 dark:border-zinc-700/60">
        <ThemeToggle collapsed={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <p className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">橘子的晴天 v1.0</p>
        )}
      </div>
    </aside>
  )
}
