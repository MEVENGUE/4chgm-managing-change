'use client'

import SprintProgress from '@/components/dashboard/SprintProgress'
import DevOpsPipeline from '@/components/dashboard/DevOpsPipeline'
import InsightFeed from '@/components/dashboard/InsightFeed'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import type { DashboardData } from '@/types/dashboard'

const DEPLOYS: AreaPoint[] = [
  { label: 'Mon', value: 12 }, { label: 'Tue', value: 18 }, { label: 'Wed', value: 15 },
  { label: 'Thu', value: 22 }, { label: 'Fri', value: 28 }, { label: 'Sat', value: 9 }, { label: 'Sun', value: 6 },
]
const VELOCITY: AreaPoint[] = [
  { label: 'S20', value: 54 }, { label: 'S21', value: 58 }, { label: 'S22', value: 61 }, { label: 'S23', value: 64 }, { label: 'S24', value: 68 },
]

const METRICS = [
  { label: 'Deploy Frequency', value: '14/day', tone: 'var(--success)' },
  { label: 'Lead Time', value: '2.4h', tone: 'var(--secondary)' },
  { label: 'Change Failure', value: '3.2%', tone: 'var(--warning)' },
  { label: 'MTTR', value: '18m', tone: 'var(--primary)' },
]

const INCIDENTS = [
  { id: '1', title: 'Elevated latency · payments-api', sev: 'medium', time: '23m ago' },
  { id: '2', title: 'Dependency CVE · auth-service', sev: 'high', time: '1h ago' },
  { id: '3', title: 'Flaky test quarantined · checkout', sev: 'low', time: '3h ago' },
]
const SEV = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--info)' }

export default function EngineeringView({ data }: { data: DashboardData }) {
  const colors = useChartColors()
  return (
    <div className="space-y-5 md:space-y-6">
      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <MotionCard key={m.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{m.label}</p>
            <p className="kpi-value mt-2" style={{ color: m.tone }}>{m.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-12 lg:items-start">
        <MotionCard delay={0.2} fillChild className="lg:col-span-7"><DevOpsPipeline stages={data.pipeline} /></MotionCard>
        <MotionCard delay={0.25} fillChild className="lg:col-span-5"><SprintProgress sprint={data.sprint} /></MotionCard>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <MotionCard delay={0.3}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Deployments (7d)</p>
            <div className="mt-4"><AreaChartPremium data={DEPLOYS} color={colors.success} height={220} showAxis showGrid /></div>
          </div>
        </MotionCard>
        <MotionCard delay={0.35}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Velocity Trend</p>
            <div className="mt-4"><AreaChartPremium data={VELOCITY} color={colors.secondary} height={220} showAxis showGrid /></div>
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <MotionCard delay={0.4} fillChild><InsightFeed title="Engineering Signals" /></MotionCard>
        <MotionCard delay={0.45}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Active Incidents</p>
            <div className="mt-4 space-y-2.5">
              {INCIDENTS.map((inc) => (
                <div key={inc.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: SEV[inc.sev as keyof typeof SEV] }} />
                  <span className="flex-1 text-xs text-[var(--text-secondary)]">{inc.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{inc.time}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionCard>
      </section>
    </div>
  )
}
