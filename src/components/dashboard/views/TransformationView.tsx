'use client'

import RoadmapTimeline from '@/components/dashboard/RoadmapTimeline'
import InitiativesPanel from '@/components/dashboard/InitiativesPanel'
import InsightFeed from '@/components/dashboard/InsightFeed'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import type { DashboardData } from '@/types/dashboard'

const ADOPTION: AreaPoint[] = [
  { label: 'Jan', value: 40 }, { label: 'Feb', value: 48 }, { label: 'Mar', value: 55 },
  { label: 'Apr', value: 61 }, { label: 'May', value: 68 }, { label: 'Jun', value: 74 },
]

const CULTURE = [
  { label: 'Adoption', value: 74 },
  { label: 'Engagement', value: 82 },
  { label: 'Maturity', value: 68 },
  { label: 'Readiness', value: 69 },
]

const RESISTANCE = [
  { team: 'Finance', level: 38 },
  { team: 'Operations', level: 24 },
  { team: 'HR', level: 19 },
  { team: 'Engineering', level: 11 },
]

export default function TransformationView({ data }: { data: DashboardData }) {
  const colors = useChartColors()
  return (
    <div className="space-y-5 md:space-y-6">
      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {CULTURE.map((c, i) => (
          <MotionCard key={c.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{c.label}</p>
            <p className="kpi-value mt-2">{c.value}%</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: `${c.value}%` }} />
            </div>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.2} className="lg:col-span-2">
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Adoption Trajectory</p>
            <div className="mt-4"><AreaChartPremium data={ADOPTION} color={colors.primary} height={240} showAxis showGrid valueSuffix="%" /></div>
          </div>
        </MotionCard>
        <MotionCard delay={0.25}>
          <ImpactDistribution segments={data.overview.impactDistribution} total={data.overview.peopleImpacted.toLocaleString()} />
        </MotionCard>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.3} fillChild><RoadmapTimeline /></MotionCard>
        <MotionCard delay={0.35} fillChild><InsightFeed title="AI Transformation Recommendations" /></MotionCard>
        <MotionCard delay={0.4}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Resistance Analysis</p>
            <div className="mt-4 space-y-3">
              {RESISTANCE.map((r) => (
                <div key={r.team}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">{r.team}</span>
                    <span className="font-semibold" style={{ color: r.level > 30 ? 'var(--danger)' : r.level > 18 ? 'var(--warning)' : 'var(--success)' }}>{r.level}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                    <div className="h-full rounded-full" style={{ width: `${r.level}%`, background: r.level > 30 ? 'var(--danger)' : r.level > 18 ? 'var(--warning)' : 'var(--success)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MotionCard>
      </section>

      <MotionCard delay={0.45} fillChild><InitiativesPanel initiatives={data.initiatives} /></MotionCard>
    </div>
  )
}
