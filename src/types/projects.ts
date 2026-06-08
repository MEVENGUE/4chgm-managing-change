export type InitiativeStatus = 'planning' | 'on-track' | 'at-risk' | 'completed' | 'on-hold'

export type Initiative = {
  id: string
  name: string
  description: string
  owner: string
  status: InitiativeStatus
  phase: string
  progress: number
  budgetPlanned: number
  budgetSpent: number
  riskScore: number
  impactScore: number
  startDate: string
  dueDate: string
  dependencies: string[]
  tags: string[]
}

export const STATUS_META: Record<InitiativeStatus, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'var(--info)' },
  'on-track': { label: 'On Track', color: 'var(--success)' },
  'at-risk': { label: 'At Risk', color: 'var(--danger)' },
  completed: { label: 'Completed', color: 'var(--primary)' },
  'on-hold': { label: 'On Hold', color: 'var(--warning)' },
}

export const PHASES = ['Discovery', 'Foundation', 'Build', 'Migration', 'Optimization', 'Scale']

/** Composite health: high progress & impact good; high risk & budget overrun bad. */
export function healthScore(i: Initiative): number {
  const budgetVariance = i.budgetPlanned > 0 ? Math.max(0, (i.budgetSpent - i.budgetPlanned) / i.budgetPlanned) : 0
  const raw = i.progress * 0.4 + i.impactScore * 0.3 + (100 - i.riskScore) * 0.3 - budgetVariance * 40
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function budgetUtilization(i: Initiative): number {
  if (i.budgetPlanned <= 0) return 0
  return Math.round((i.budgetSpent / i.budgetPlanned) * 100)
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}
