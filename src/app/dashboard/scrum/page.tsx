'use client'

import { useEffect, useState } from 'react'
import { Kanban } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import SprintProgress from '@/components/dashboard/SprintProgress'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { fetchDashboardData } from '@/services/dashboard'
import type { SprintData } from '@/types/dashboard'

const BOARD = {
  'To Do': ['Refine API contract', 'Design migration plan', 'Spike: caching layer'],
  'In Progress': ['Implement auth flow', 'Build analytics widget'],
  Review: ['PR #482 pipeline', 'PR #486 globe'],
  Done: ['Theme system', 'Ambient background', 'Premium charts'],
}

const VELOCITY: AreaPoint[] = [
  { label: 'S20', value: 54 }, { label: 'S21', value: 58 }, { label: 'S22', value: 61 },
  { label: 'S23', value: 64 }, { label: 'S24', value: 68 },
]

export default function ScrumPage() {
  const colors = useChartColors()
  const [sprint, setSprint] = useState<SprintData | undefined>(undefined)

  useEffect(() => {
    fetchDashboardData().then((d) => setSprint(d.sprint))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader icon={Kanban} title="Scrum Hub" subtitle="Sprint delivery, board and velocity" />

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <MotionCard delay={0.05} fillChild><SprintProgress sprint={sprint} /></MotionCard>
        <MotionCard delay={0.1}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Velocity Trend</p>
            <div className="mt-4">
              <AreaChartPremium data={VELOCITY} color={colors.secondary} height={200} showAxis showGrid />
            </div>
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(BOARD).map(([col, items], i) => (
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
