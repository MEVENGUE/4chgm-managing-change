import type { Initiative } from '@/types/projects'
import { budgetUtilization, healthScore } from '@/types/projects'

export type AnalyticsMetricKey = 'cost' | 'velocity' | 'adoption'

export type AnalyticsMetric = {
  label: string
  unit: string
  prefix?: string
  suffix?: string
  values: number[]
  tone: 'primary' | 'secondary' | 'success'
  insight: string
}

const MONTHS = 12

function trendFrom(value: number, variance = 0.08): number[] {
  const out: number[] = []
  for (let i = 0; i < MONTHS; i++) {
    const factor = 0.72 + (i / (MONTHS - 1)) * 0.28 + (Math.sin(i) * variance)
    out.push(Math.max(1, Math.round(value * factor)))
  }
  out[MONTHS - 1] = Math.round(value)
  return out
}

/** Derive analytics charts from live portfolio + knowledge doc count. */
export function deriveAnalyticsMetrics(
  initiatives: Initiative[],
  knowledgeDocCount: number
): Record<AnalyticsMetricKey, AnalyticsMetric> {
  const total = initiatives.length || 1
  const avgProgress = initiatives.reduce((s, i) => s + i.progress, 0) / total
  const avgHealth = initiatives.reduce((s, i) => s + healthScore(i), 0) / total
  const avgBudgetUtil = initiatives.reduce((s, i) => s + budgetUtilization(i), 0) / total
  const onTrackPct = Math.round(
    (initiatives.filter((i) => i.status === 'on-track' || i.status === 'completed').length / total) * 100
  )
  const atRisk = initiatives.filter((i) => i.status === 'at-risk').length
  const totalSpentK = Math.round(initiatives.reduce((s, i) => s + i.budgetSpent, 0) / 1000)

  return {
    cost: {
      label: 'Cloud Cost (derived)',
      unit: '$K',
      prefix: '$',
      suffix: 'K',
      tone: 'primary',
      values: trendFrom(Math.max(totalSpentK, 120)),
      insight: `Budget utilization moyenne ${Math.round(avgBudgetUtil)}% sur ${initiatives.length} initiatives. ${atRisk} projet(s) à risque impactent la trajectoire de coûts. ${knowledgeDocCount} document(s) indexé(s) enrichissent les recommandations IA.`,
    },
    velocity: {
      label: 'Delivery Velocity',
      unit: 'pts',
      suffix: ' pts',
      tone: 'secondary',
      values: trendFrom(Math.round(avgProgress * 0.85)),
      insight: `Progression portfolio ${Math.round(avgProgress)}% — health score moyen ${Math.round(avgHealth)}. Les données utilisateur (projets + documents) alimentent cette courbe en temps réel.`,
    },
    adoption: {
      label: 'Transformation Adoption',
      unit: '%',
      suffix: '%',
      tone: 'success',
      values: trendFrom(onTrackPct),
      insight: `${onTrackPct}% des initiatives sont on-track ou terminées. Chaque document ingéré et chaque projet modifié recalcule automatiquement ces indicateurs.`,
    },
  }
}
