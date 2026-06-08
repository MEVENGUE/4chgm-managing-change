import type { Initiative } from '@/types/projects'
import { formatCurrency } from '@/types/projects'
import { generateInsights, forecastPortfolio, type Insight, type Forecast } from '@/lib/insights'

export type IntelNotification = {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
  time: string
  source: 'project' | 'budget' | 'risk' | 'system'
}

export type AnalyticsSnapshot = {
  velocityTrend: number
  adoptionTrend: number
  costVariance: number
  atRiskPct: number
  onTrackPct: number
}

export type RiskSummary = {
  high: number
  medium: number
  low: number
  topRisks: { name: string; score: number; owner: string }[]
}

export type RoadmapSnapshot = {
  phase: string
  count: number
  avgProgress: number
  initiatives: string[]
}[]

export type PlatformIntelligence = {
  insights: Insight[]
  forecast: Forecast
  analytics: AnalyticsSnapshot
  risks: RiskSummary
  roadmap: RoadmapSnapshot
  notifications: IntelNotification[]
  executiveSummary: string
  recommendations: string[]
  updatedAt: string
}

/** Unified derived-state engine — recalculates when portfolio changes. */
export function derivePlatformState(initiatives: Initiative[]): PlatformIntelligence {
  const insights = generateInsights(initiatives)
  const forecast = forecastPortfolio(initiatives)
  const total = initiatives.length || 1
  const atRisk = initiatives.filter((i) => i.status === 'at-risk').length
  const onTrack = initiatives.filter((i) => i.status === 'on-track' || i.status === 'completed').length

  const analytics: AnalyticsSnapshot = {
    velocityTrend: Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / total),
    adoptionTrend: Math.min(100, Math.round(onTrack / total * 100 + 12)),
    costVariance: forecast.overrunPct,
    atRiskPct: Math.round((atRisk / total) * 100),
    onTrackPct: Math.round((onTrack / total) * 100),
  }

  const topRisks = [...initiatives]
    .filter((i) => i.status !== 'completed')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((i) => ({ name: i.name, score: i.riskScore, owner: i.owner }))

  const risks: RiskSummary = {
    high: initiatives.filter((i) => i.riskScore >= 70).length,
    medium: initiatives.filter((i) => i.riskScore >= 45 && i.riskScore < 70).length,
    low: initiatives.filter((i) => i.riskScore < 45).length,
    topRisks,
  }

  const phaseMap = new Map<string, Initiative[]>()
  for (const i of initiatives) {
    const arr = phaseMap.get(i.phase) ?? []
    arr.push(i)
    phaseMap.set(i.phase, arr)
  }
  const roadmap: RoadmapSnapshot = Array.from(phaseMap.entries()).map(([phase, items]) => ({
    phase,
    count: items.length,
    avgProgress: Math.round(items.reduce((s, x) => s + x.progress, 0) / items.length),
    initiatives: items.map((x) => x.name),
  }))

  const notifications: IntelNotification[] = insights.slice(0, 5).map((ins, idx) => ({
    id: ins.id,
    title: ins.title,
    severity: ins.severity,
    time: `${(idx + 1) * 3}m ago`,
    source: ins.kind === 'budget' ? 'budget' : ins.kind === 'risk' ? 'risk' : 'project',
  }))

  const recommendations: string[] = []
  if (forecast.overrunPct > 5) recommendations.push(`Address budget drift — projected ${forecast.overrunPct}% overrun across portfolio.`)
  if (atRisk > 0) recommendations.push(`Prioritize ${atRisk} at-risk initiative${atRisk > 1 ? 's' : ''} in this week's steering committee.`)
  if (risks.high > 0) recommendations.push(`Mitigate ${risks.high} high-severity risk${risks.high > 1 ? 's' : ''} before next sprint planning.`)
  if (recommendations.length === 0) recommendations.push('Portfolio is stable — consider accelerating high-impact initiatives.')

  const executiveSummary = `Portfolio health ${forecast.avgHealth}/100 with ${initiatives.length} active initiatives. ${onTrack} on track, ${atRisk} at risk. Budget forecast ${forecast.overrunPct >= 0 ? '+' : ''}${forecast.overrunPct}% vs plan (${formatCurrency(forecast.projectedTotal)} projected). ${insights.filter((i) => i.severity === 'high').length} high-priority signals require executive attention.`

  return {
    insights,
    forecast,
    analytics,
    risks,
    roadmap,
    notifications,
    executiveSummary,
    recommendations,
    updatedAt: new Date().toISOString(),
  }
}
