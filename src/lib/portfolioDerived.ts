import type { Initiative } from '@/types/projects'
import { formatCurrency } from '@/types/projects'
import { forecastPortfolio } from '@/lib/insights'
import type { AnalyticsSnapshot } from '@/lib/intelligence'
import type { ForecastData } from '@/services/forecast'
import type { RoadmapPhase } from '@/services/roadmap'
import type { AreaPoint } from '@/components/charts/AreaChartPremium'

const PHASE_COLORS = ['var(--success)', 'var(--primary)', 'var(--secondary)', 'var(--warning)', 'var(--info)', '#06b6d4']
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

export function buildCostForecastFromPortfolio(initiatives: Initiative[]): ForecastData {
  const forecast = forecastPortfolio(initiatives)
  const base = forecast.totalSpent / 1000
  const step = (forecast.projectedTotal - forecast.totalSpent) / 4 / 1000
  return {
    projectedTotal: formatCurrency(forecast.projectedTotal),
    confidence: Math.max(60, Math.min(95, 100 - Math.abs(forecast.overrunPct))),
    savingsOpportunity: formatCurrency(Math.max(0, forecast.totalPlanned - forecast.totalSpent)),
    points: ['Q1', 'Q2', 'Q3', 'Q4'].map((month, i) => ({
      month,
      value: Math.round(base + step * (i + 1)),
    })),
  }
}

export function buildRoadmapPhasesFromPortfolio(initiatives: Initiative[]): RoadmapPhase[] {
  const phaseMap = new Map<string, Initiative[]>()
  for (const i of initiatives) {
    const arr = phaseMap.get(i.phase) ?? []
    arr.push(i)
    phaseMap.set(i.phase, arr)
  }
  return Array.from(phaseMap.entries()).map(([phase, items], idx) => {
    const avgProgress = Math.round(items.reduce((s, x) => s + x.progress, 0) / items.length)
    const startIdx = Math.min(idx, MONTHS.length - 2)
    return {
      id: `phase-${idx}`,
      name: phase,
      start: MONTHS[startIdx],
      end: MONTHS[Math.min(startIdx + 2, MONTHS.length - 1)],
      progress: avgProgress,
      color: PHASE_COLORS[idx % PHASE_COLORS.length],
    }
  })
}

export function deriveCultureMetrics(initiatives: Initiative[], analytics: AnalyticsSnapshot) {
  const avgProgress = initiatives.length
    ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length)
    : 0
  return [
    { label: 'Engagement', value: Math.min(100, analytics.onTrackPct + 10) },
    { label: 'Adoption Rate', value: analytics.adoptionTrend },
    { label: 'Satisfaction', value: Math.min(100, avgProgress + 15) },
    { label: 'Readiness', value: analytics.velocityTrend },
  ]
}

export function deriveDevOpsMetrics(initiatives: Initiative[]) {
  const avgProgress = initiatives.length
    ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length)
    : 0
  const atRisk = initiatives.filter((i) => i.status === 'at-risk').length
  const deployFreq = Math.max(1, Math.round(avgProgress / 5))
  return [
    { label: 'Deploy Frequency', value: `${deployFreq}/day` },
    { label: 'Lead Time', value: `${Math.max(0.8, 3 - avgProgress / 40).toFixed(1)}h` },
    {
      label: 'Change Failure',
      value: `${Math.max(1, Math.round((atRisk / Math.max(1, initiatives.length)) * 20))}%`,
    },
    { label: 'MTTR', value: `${Math.max(10, 30 - Math.round(avgProgress / 3))}m` },
  ]
}

export function deriveDeploySeries(initiatives: Initiative[]): AreaPoint[] {
  const base = Math.max(
    4,
    Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / Math.max(1, initiatives.length) / 5)
  )
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
    label,
    value: Math.round(base * (0.75 + i * 0.12)),
  }))
}

export function deriveScrumBoard(initiatives: Initiative[]): Record<string, string[]> {
  const todo = initiatives.filter((i) => i.status === 'planning' || i.progress < 25).map((i) => i.name)
  const inProgress = initiatives
    .filter((i) => i.progress >= 25 && i.progress < 75 && i.status !== 'completed')
    .map((i) => i.name)
  const review = initiatives.filter((i) => i.status === 'at-risk' || i.riskScore >= 60).map((i) => i.name)
  const done = initiatives.filter((i) => i.status === 'completed' || i.progress >= 90).map((i) => i.name)
  return {
    'To Do': todo.length ? todo : ['Refine scope for next wave'],
    'In Progress': inProgress.length ? inProgress : ['Active portfolio delivery'],
    Review: review.length ? review : ['Portfolio risk review'],
    Done: done.length ? done : ['Foundation milestones'],
  }
}

export function deriveVelocitySeries(initiatives: Initiative[]): AreaPoint[] {
  const avg = initiatives.length
    ? Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length)
    : 50
  return ['S20', 'S21', 'S22', 'S23', 'S24'].map((label, i) => ({
    label,
    value: Math.max(20, Math.round(avg - 10 + i * 3)),
  }))
}
