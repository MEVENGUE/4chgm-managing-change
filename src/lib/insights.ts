import { budgetUtilization, healthScore, type Initiative } from '@/types/projects'

export type InsightKind = 'risk' | 'budget' | 'bottleneck' | 'anomaly' | 'positive'

export type Insight = {
  id: string
  kind: InsightKind
  severity: 'high' | 'medium' | 'low'
  title: string
  detail: string
}

const KIND_LABEL: Record<InsightKind, string> = {
  risk: 'Risk',
  budget: 'Budget drift',
  bottleneck: 'Bottleneck',
  anomaly: 'Anomaly',
  positive: 'Positive signal',
}

export function kindLabel(kind: InsightKind): string {
  return KIND_LABEL[kind]
}

/** Derives an executive insight feed from the live portfolio. */
export function generateInsights(initiatives: Initiative[]): Insight[] {
  const insights: Insight[] = []

  for (const i of initiatives) {
    const util = budgetUtilization(i)
    if (util > 95) {
      insights.push({
        id: `budget-${i.id}`,
        kind: 'budget',
        severity: util > 105 ? 'high' : 'medium',
        title: `${i.name} is approaching budget ceiling`,
        detail: `${util}% of the ${i.phase} budget is consumed at ${i.progress}% progress — projected overrun if unmanaged.`,
      })
    }
    if (i.riskScore >= 65 && i.status !== 'completed') {
      insights.push({
        id: `risk-${i.id}`,
        kind: 'risk',
        severity: i.riskScore >= 75 ? 'high' : 'medium',
        title: `${i.name} carries elevated risk (${i.riskScore})`,
        detail: `Owner ${i.owner}. Recommend a mitigation review this week to protect the ${i.impactScore} impact score.`,
      })
    }
    // Schedule anomaly: low progress but high budget burn
    if (i.progress < 40 && util > 55) {
      insights.push({
        id: `anomaly-${i.id}`,
        kind: 'anomaly',
        severity: 'medium',
        title: `${i.name} burn rate outpaces progress`,
        detail: `${util}% budget used vs ${i.progress}% delivered — a leading indicator of schedule slip.`,
      })
    }
    if (healthScore(i) >= 80) {
      insights.push({
        id: `positive-${i.id}`,
        kind: 'positive',
        severity: 'low',
        title: `${i.name} is a portfolio bright spot`,
        detail: `Health ${healthScore(i)} with strong delivery and contained risk. Consider it a template for other initiatives.`,
      })
    }
  }

  // Dependency bottlenecks: an at-risk initiative that others depend on
  const dependedOn = new Map<string, number>()
  for (const i of initiatives) for (const d of i.dependencies) dependedOn.set(d, (dependedOn.get(d) ?? 0) + 1)
  for (const [id, count] of dependedOn) {
    const dep = initiatives.find((i) => i.id === id)
    if (dep && (dep.status === 'at-risk' || dep.riskScore >= 60) && count >= 1) {
      insights.push({
        id: `bottleneck-${id}`,
        kind: 'bottleneck',
        severity: 'high',
        title: `${dep.name} is blocking ${count} initiative${count > 1 ? 's' : ''}`,
        detail: `It is at risk while ${count} dependent initiative${count > 1 ? 's rely' : ' relies'} on it. Unblocking it has cascading upside.`,
      })
    }
  }

  const order = { high: 0, medium: 1, low: 2 }
  return insights.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 8)
}

export type Forecast = {
  totalPlanned: number
  totalSpent: number
  projectedTotal: number
  overrunPct: number
  atRiskCount: number
  avgHealth: number
}

export function forecastPortfolio(initiatives: Initiative[]): Forecast {
  const totalPlanned = initiatives.reduce((s, i) => s + i.budgetPlanned, 0)
  const totalSpent = initiatives.reduce((s, i) => s + i.budgetSpent, 0)
  // Project final spend by extrapolating burn rate against progress
  const projectedTotal = initiatives.reduce((s, i) => {
    const ratio = i.progress > 5 ? i.budgetSpent / (i.progress / 100) : i.budgetPlanned
    return s + Math.max(i.budgetPlanned, ratio)
  }, 0)
  const overrunPct = totalPlanned > 0 ? Math.round(((projectedTotal - totalPlanned) / totalPlanned) * 100) : 0
  const atRiskCount = initiatives.filter((i) => i.status === 'at-risk').length
  const avgHealth = initiatives.length ? Math.round(initiatives.reduce((s, i) => s + healthScore(i), 0) / initiatives.length) : 0
  return { totalPlanned, totalSpent, projectedTotal, overrunPct, atRiskCount, avgHealth }
}
