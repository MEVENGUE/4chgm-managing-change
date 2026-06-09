'use client'

import RoadmapTimeline from '@/components/dashboard/RoadmapTimeline'
import InitiativesPanel from '@/components/dashboard/InitiativesPanel'
import InsightFeed from '@/components/dashboard/InsightFeed'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'
import { deriveCultureMetrics } from '@/lib/portfolioDerived'
import type { DashboardData } from '@/types/dashboard'

export default function TransformationView({ data }: { data: DashboardData }) {
  const colors = useChartColors()
  const { initiatives, intel } = usePortfolioDashboard()
  const culture = deriveCultureMetrics(initiatives, intel.analytics)

  const adoption: AreaPoint[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
    label,
    value: Math.max(20, intel.analytics.adoptionTrend - (5 - i) * 6),
  }))

  const resistance = initiatives
    .filter((i) => i.riskScore >= 40)
    .slice(0, 4)
    .map((i) => ({ team: i.owner.split(' ')[0] ?? i.name, level: i.riskScore }))

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {culture.map((c, i) => (
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
            <div className="mt-4"><AreaChartPremium data={adoption} color={colors.primary} height={240} showAxis showGrid valueSuffix="%" /></div>
          </div>
        </MotionCard>
        <MotionCard delay={0.25}>
          <ImpactDistribution segments={data.overview.impactDistribution} total={data.overview.peopleImpacted.toLocaleString()} />
        </MotionCard>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.3} fillChild><RoadmapTimeline roadmap={intel.roadmap} /></MotionCard>
        <MotionCard delay={0.35} fillChild><InsightFeed title="AI Transformation Recommendations" /></MotionCard>
        <MotionCard delay={0.4}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Resistance Analysis</p>
            <div className="mt-4 space-y-3">
              {(resistance.length ? resistance : [{ team: 'Portfolio', level: 15 }]).map((r) => (
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
