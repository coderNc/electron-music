import { useUIStore } from '@renderer/stores/ui-store'
import { Sidebar } from './Sidebar'
import { PlayerBar } from './PlayerBar'
import { QueuePanel } from '@renderer/components/queue'
import { LyricsPanel } from '@renderer/components/lyrics'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const queueVisible = useUIStore((state) => state.queueVisible)
  const lyricsVisible = useUIStore((state) => state.lyricsVisible)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-900 dark:text-zinc-100">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main
          className={`flex-1 overflow-hidden transition-all duration-200 ${
            sidebarCollapsed ? 'ml-16' : 'ml-56'
          } ${queueVisible ? 'mr-80' : ''} ${lyricsVisible ? 'mr-80' : ''}`}
        >
          <div className="h-full overflow-auto p-4">{children}</div>
        </main>

        {/* Queue panel (conditionally rendered) */}
        {queueVisible && (
          <aside className="fixed right-0 top-0 h-[calc(100vh-80px)] w-80 border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <QueuePanel />
          </aside>
        )}

        {/* Lyrics panel (conditionally rendered) */}
        {lyricsVisible && !queueVisible && (
          <aside className="fixed right-0 top-0 h-[calc(100vh-80px)] w-80 border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <LyricsPanel className="h-full" />
          </aside>
        )}
      </div>

      {/* Player bar at bottom */}
      <PlayerBar />
    </div>
  )
}
