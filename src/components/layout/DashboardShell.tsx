'use client'

import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import CommandPalette from '@/components/layout/CommandPalette'
import AmbientBackground from '@/components/layout/AmbientBackground'
import OnboardingBanner from '@/components/layout/OnboardingBanner'
import { ShellProvider } from '@/providers/ShellProvider'
import { CopilotProvider } from '@/providers/CopilotProvider'
import { ProjectsProvider } from '@/providers/ProjectsProvider'
import { IntelligenceProvider } from '@/providers/IntelligenceProvider'
import { DashboardLayoutProvider } from '@/providers/DashboardLayoutProvider'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <ProjectsProvider>
      <IntelligenceProvider>
      <DashboardLayoutProvider>
      <CopilotProvider>
      <div className="dashboard-layout relative flex h-screen min-h-screen w-full overflow-hidden text-[var(--text-primary)]">
        <AmbientBackground variant="subtle" />
        <Sidebar />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="relative z-50 shrink-0 overflow-visible">
            <Topbar />
          </div>
          <main className="dashboard-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <OnboardingBanner />
            {children}
          </main>
        </div>
        <CommandPalette />
      </div>
      </CopilotProvider>
      </DashboardLayoutProvider>
      </IntelligenceProvider>
      </ProjectsProvider>
    </ShellProvider>
  )
}
