'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useOrganization } from '@/providers/OrganizationProvider'
import type { WorkspaceView } from '@/lib/workspaces'
import { useTranslation } from '@/i18n/I18nProvider'

const VIEW_KEYS: Record<WorkspaceView, string> = {
  executive: 'dashboard.executive',
  engineering: 'dashboard.engineering',
  transformation: 'dashboard.transformation',
  finance: 'dashboard.finance',
}
import ExecutiveView from '@/components/dashboard/views/ExecutiveView'
import EngineeringView from '@/components/dashboard/views/EngineeringView'
import TransformationView from '@/components/dashboard/views/TransformationView'
import FinanceView from '@/components/dashboard/views/FinanceView'
import { useProjects } from '@/providers/ProjectsProvider'
import { buildDashboardFromPortfolio } from '@/lib/portfolioDashboard'
import { getAllSources, KNOWLEDGE_UPDATED_EVENT } from '@/services/knowledge'
import type { DashboardData } from '@/types/dashboard'
import { GenerateReportButton } from '@/components/reports/ExecutiveReportModal'
import DashboardCustomizeBar from '@/components/dashboard/DashboardCustomizeBar'

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse-soft md:space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-3xl" />)}
      </div>
      <div className="grid gap-5 md:gap-6 lg:grid-cols-12">
        <div className="skeleton h-72 rounded-3xl lg:col-span-8" />
        <div className="skeleton h-72 rounded-3xl lg:col-span-4" />
      </div>
    </div>
  )
}

function ViewHeader() {
  const { organization, activeWorkspace } = useOrganization()
  const { t } = useTranslation()
  const greeting = organization.onboarded ? organization.name : t('brand.name')
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${activeWorkspace.accent}, color-mix(in srgb, ${activeWorkspace.accent} 55%, #000))` }}>
          {activeWorkspace.name.slice(0, 1)}
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{t(VIEW_KEYS[activeWorkspace.view])}</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{greeting} · {activeWorkspace.name}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {activeWorkspace.view === 'executive' && <GenerateReportButton />}
        {activeWorkspace.view === 'executive' && <DashboardCustomizeBar />}
        <span className="rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
          {t('dashboard.roleBadge', { role: activeWorkspace.role })}
        </span>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { activeWorkspace } = useOrganization()
  const { initiatives, ready: projectsReady } = useProjects()
  const [knowledgeTick, setKnowledgeTick] = useState(0)

  useEffect(() => {
    const refresh = () => setKnowledgeTick((n) => n + 1)
    window.addEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
  }, [])

  const data: DashboardData | null = useMemo(() => {
    if (!projectsReady) return null
    return buildDashboardFromPortfolio(initiatives, getAllSources())
  }, [initiatives, projectsReady, knowledgeTick])

  if (!data) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <ViewHeader />
      {activeWorkspace.view === 'executive' && <ExecutiveView data={data} />}
      {activeWorkspace.view === 'engineering' && <EngineeringView data={data} />}
      {activeWorkspace.view === 'transformation' && <TransformationView data={data} />}
      {activeWorkspace.view === 'finance' && <FinanceView />}
    </div>
  )
}
