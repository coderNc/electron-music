import * as React from 'react'
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
  const isMacOS = navigator.platform.toLowerCase().includes('mac')
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const content = contentRef.current
    if (!content) return

    const handleScroll = (): void => {
      const y = content.scrollTop
      document.documentElement.style.setProperty('--parallax-y', `${Math.max(-10, -y * 0.04)}px`)
    }

    content.addEventListener('scroll', handleScroll, { passive: true })
    return () => content.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden text-zinc-900 transition-colors dark:text-zinc-100 ${
        isMacOS ? 'bg-transparent macos-vibrancy' : 'bg-zinc-50/50 dark:bg-zinc-900/70'
      }`}
    >
      {isMacOS && (
        <div
          className="fixed left-0 right-0 top-0 z-50 h-[38px]"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main
          className={`flex-1 overflow-hidden transition-all duration-200 ${
            sidebarCollapsed ? 'ml-24' : 'ml-56'
          } ${queueVisible ? 'mr-80' : ''} ${lyricsVisible ? 'mr-80' : ''}`}
        >
          <div ref={contentRef} className="h-full overflow-auto px-4 pt-4 pb-20 page-enter">
            <div className="scroll-parallax">{children}</div>
          </div>
        </main>

        {queueVisible && (
          <aside
            className="side-panel-flat fixed right-0 top-0 bottom-20 w-80 border-l border-white/20 dark:border-white/10"
            style={isMacOS ? { paddingTop: '38px' } : undefined}
          >
            <QueuePanel />
          </aside>
        )}

        {lyricsVisible && !queueVisible && (
          <aside
            className="side-panel-flat fixed right-0 top-0 bottom-20 w-80 border-l border-white/20 dark:border-white/10"
            style={isMacOS ? { paddingTop: '38px' } : undefined}
          >
            <LyricsPanel className="h-full" />
          </aside>
        )}
      </div>
      <PlayerBar />
    </div>
  )
}
