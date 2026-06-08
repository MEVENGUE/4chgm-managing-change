import type { Initiative } from '@/types/projects'
import { healthScore, budgetUtilization, formatCurrency } from '@/types/projects'
import type { DashboardData } from '@/types/dashboard'
import type { KnowledgeSource } from '@/services/knowledge'

/** Build live dashboard metrics from user portfolio + knowledge base. */
export function buildDashboardFromPortfolio(
  initiatives: Initiative[],
  knowledgeSources: KnowledgeSource[] = []
): DashboardData {
  const total = initiatives.length || 1
  const onTrack = initiatives.filter((i) => i.status === 'on-track' || i.status === 'completed').length
  const atRisk = initiatives.filter((i) => i.status === 'at-risk').length
  const completed = initiatives.filter((i) => i.status === 'completed').length
  const avgHealth = Math.round(initiatives.reduce((s, i) => s + healthScore(i), 0) / total)
  const avgProgress = Math.round(initiatives.reduce((s, i) => s + i.progress, 0) / total)
  const totalBudget = initiatives.reduce((s, i) => s + i.budgetPlanned, 0)
  const spentBudget = initiatives.reduce((s, i) => s + i.budgetSpent, 0)
  const savings = Math.max(0, totalBudget - spentBudget)

  const highImpact = initiatives.filter((i) => i.impactScore >= 70).length
  const medImpact = initiatives.filter((i) => i.impactScore >= 40 && i.impactScore < 70).length
  const lowImpact = total - highImpact - medImpact

  const progressTrend = initiatives.slice(0, 8).map((i) => i.progress)
  while (progressTrend.length < 8) progressTrend.push(avgProgress)

  return {
    kpis: [
      {
        id: 'transformation',
        title: 'Transformation Score',
        value: `${avgHealth}`,
        change: `${onTrack}/${total} initiatives on track`,
        trend: progressTrend,
        trendTone: 'primary',
      },
      {
        id: 'projects',
        title: 'Total Projects',
        value: initiatives.length,
        change: `${atRisk} at risk · ${completed} completed`,
        trend: [Math.max(1, initiatives.length - 3), initiatives.length - 2, initiatives.length - 1, initiatives.length].filter((n) => n > 0),
        trendTone: 'secondary',
      },
      {
        id: 'savings',
        title: 'Budget Headroom',
        value: formatCurrency(savings),
        change: `${Math.round((spentBudget / Math.max(1, totalBudget)) * 100)}% utilized`,
        trend: initiatives.slice(0, 8).map((i) => budgetUtilization(i) / 10),
        trendTone: 'success',
      },
      {
        id: 'knowledge',
        title: 'Knowledge Indexed',
        value: knowledgeSources.length,
        change: `${knowledgeSources.filter((s) => s.type === 'note').length} user-ingested`,
        trend: [knowledgeSources.length],
        trendTone: 'warning',
      },
    ],
    overview: {
      peopleImpacted: initiatives.reduce((s, i) => s + i.impactScore * 10, 0),
      projectsOnTrack: onTrack,
      projectsTotal: initiatives.length,
      atRisk,
      completed,
      impactDistribution: [
        { label: 'High', value: Math.round((highImpact / total) * 100), color: 'var(--danger)' },
        { label: 'Medium', value: Math.round((medImpact / total) * 100), color: 'var(--warning)' },
        { label: 'Low', value: Math.max(0, Math.round((lowImpact / total) * 100)), color: 'var(--success)' },
      ],
    },
    insights: initiatives
      .filter((i) => i.status === 'at-risk' || i.riskScore >= 60)
      .slice(0, 4)
      .map((i, idx) => ({
        id: String(idx),
        text: `${i.name}: risk ${i.riskScore}, progress ${i.progress}%`,
        priority: i.riskScore >= 70 ? 'high' : 'medium',
        tag: i.status === 'at-risk' ? 'At Risk' : 'Watch',
      })),
    initiatives: initiatives.slice(0, 6).map((i) => ({
      id: i.id,
      name: i.name,
      progress: i.progress,
      status: i.status,
    })),
    collaboration: knowledgeSources.slice(0, 4).map((s, idx) => ({
      id: String(idx),
      user: 'Knowledge Base',
      action: `indexed "${s.title}"`,
      time: s.ingestedAt,
    })),
    sprint: {
      name: 'Portfolio Sprint',
      progress: avgProgress,
      storyPoints: { done: Math.round(avgProgress * 5), total: 500 },
      tasksCompleted: onTrack,
      tasksTotal: initiatives.length,
    },
    pipeline: [
      { id: '1', name: 'Data ingest', status: knowledgeSources.length > 0 ? 'done' : 'pending', time: 'live' },
      { id: '2', name: 'Portfolio sync', status: 'done', time: 'live' },
      { id: '3', name: 'AI analysis', status: 'active', time: 'OpenAI' },
      { id: '4', name: 'Insights', status: avgHealth > 70 ? 'done' : 'active', time: 'derived' },
    ],
    healthScore: avgHealth,
  }
}
