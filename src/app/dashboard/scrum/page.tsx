'use client'

import { Kanban } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import SprintProgress from '@/components/dashboard/SprintProgress'
import AreaChartPremium from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'
import { deriveScrumBoard, deriveVelocitySeries } from '@/lib/portfolioDerived'

export default function ScrumPage() {
  const colors = useChartColors()
  const { data, initiatives, ready } = usePortfolioDashboard()
  const board = deriveScrumBoard(initiatives)
  const velocity = deriveVelocitySeries(initiatives)

  if (!ready) {
    return <div className="h-64 animate-pulse-soft rounded-3xl bg-[var(--bg-surface)]" />
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Kanban} title="Scrum Hub" subtitle="Sprint delivery, board and velocity" />

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <MotionCard delay={0.05} fillChild><SprintProgress sprint={data.sprint} /></MotionCard>
        <MotionCard delay={0.1}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Velocity Trend</p>
            <div className="mt-4">
              <AreaChartPremium data={velocity} color={colors.secondary} height={200} showAxis showGrid />
            </div>
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(board).map(([col, items], i) => (
          <MotionCard key={col} delay={0.1 + i * 0.05} className="glass-panel-strong rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <p className="section-title">{col}</p>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">{items.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {items.map((item) => (
                <div key={item} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5 text-xs text-[var(--text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </MotionCard>
        ))}
      </section>
    </div>
  )
}
