'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import InsightsPanel from '@/components/dashboard/InsightsPanel'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import { fetchDashboardData } from '@/services/dashboard'
import type { DashboardData } from '@/types/dashboard'

export default function RisksPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboardData().then(setData)
  }, [])

  const counts = data
    ? {
        high: data.insights.filter((i) => i.priority === 'high').length,
        medium: data.insights.filter((i) => i.priority === 'medium').length,
        low: data.insights.filter((i) => i.priority === 'low').length,
      }
    : { high: 0, medium: 0, low: 0 }

  const stats = [
    { label: 'High Risk', value: counts.high, color: 'var(--danger)' },
    { label: 'Medium Risk', value: counts.medium, color: 'var(--warning)' },
    { label: 'Low Risk', value: counts.low, color: 'var(--info)' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader icon={ShieldAlert} title="Risks & Impact" subtitle="Portfolio risk register and impact distribution" />

      <section className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {stats.map((s, i) => (
          <MotionCard key={s.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-3" style={{ color: s.color }}>{s.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.1} className="lg:col-span-2">
          {data && <InsightsPanel insights={data.insights} />}
        </MotionCard>
        <MotionCard delay={0.15}>
          {data && (
            <ImpactDistribution
              segments={data.overview.impactDistribution}
              total={data.overview.peopleImpacted.toLocaleString()}
            />
          )}
        </MotionCard>
      </section>
    </div>
  )
}
