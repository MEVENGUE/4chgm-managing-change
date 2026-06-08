import type { DashboardData } from '@/types/dashboard'
import { withApi } from '@/lib/apiClient'

const MOCK_DASHBOARD: DashboardData = {
  kpis: [
    { id: 'transformation', title: 'Transformation Score', value: '87.4', change: '↑ 12.5% vs last month', trend: [62, 65, 64, 70, 73, 78, 82, 87], trendTone: 'primary' },
    { id: 'projects', title: 'Total Projects', value: 24, change: '↑ 3 this week', trend: [14, 16, 17, 18, 20, 21, 23, 24], trendTone: 'secondary' },
    { id: 'savings', title: 'Cost Savings (YTD)', value: '$2.48M', change: '↑ 18.7% vs last year', trend: [1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.48], trendTone: 'success' },
    { id: 'velocity', title: 'Velocity (Avg)', value: '68.2', change: '↑ 7.3% vs last sprint', trend: [54, 58, 56, 61, 60, 64, 66, 68], trendTone: 'warning' },
  ],
  overview: {
    peopleImpacted: 2847,
    projectsOnTrack: 18,
    projectsTotal: 24,
    atRisk: 3,
    completed: 8,
    impactDistribution: [
      { label: 'High', value: 32, color: 'var(--danger)' },
      { label: 'Medium', value: 45, color: 'var(--warning)' },
      { label: 'Low', value: 23, color: 'var(--success)' },
    ],
  },
  insights: [
    { id: '1', text: 'Cloud migration costs trending 15% above forecast for Q3.', priority: 'high', tag: 'High Impact' },
    { id: '2', text: 'Team velocity increased 7.3% — consider expanding sprint capacity.', priority: 'medium', tag: 'Medium Risk' },
    { id: '3', text: '3 initiatives approaching deadline without risk mitigation plan.', priority: 'high', tag: 'High Impact' },
    { id: '4', text: 'Stakeholder engagement score improved to 82% this quarter.', priority: 'low', tag: 'Positive' },
  ],
  initiatives: [
    { id: '1', name: 'Cloud Migration Phase 2', progress: 72, status: 'on-track' },
    { id: '2', name: 'ERP Modernization', progress: 45, status: 'at-risk' },
    { id: '3', name: 'AI Adoption Program', progress: 88, status: 'on-track' },
    { id: '4', name: 'Data Governance Framework', progress: 34, status: 'at-risk' },
  ],
  collaboration: [
    { id: '1', user: 'Alex Johnson', action: 'updated the roadmap timeline', time: '2m ago' },
    { id: '2', user: 'Maria Santos', action: 'completed sprint review', time: '15m ago' },
    { id: '3', user: 'James Park', action: 'flagged risk on ERP project', time: '1h ago' },
    { id: '4', user: 'Dr. Sarah Chen', action: 'approved Q3 budget forecast', time: '2h ago' },
  ],
  sprint: {
    name: 'Sprint 24',
    progress: 68,
    storyPoints: { done: 342, total: 500 },
    tasksCompleted: 47,
    tasksTotal: 62,
  },
  pipeline: [
    { id: '1', name: 'Code Commit', status: 'done', time: '2m ago' },
    { id: '2', name: 'Build', status: 'done', time: '1m ago' },
    { id: '3', name: 'Tests', status: 'done', time: '45s ago' },
    { id: '4', name: 'Security Scan', status: 'done', time: '30s ago' },
    { id: '5', name: 'Deploy', status: 'active', time: 'In progress' },
    { id: '6', name: 'Monitor', status: 'pending' },
  ],
  healthScore: 98.6,
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return withApi('/api/dashboard', async () => {
    await delay(300)
    return MOCK_DASHBOARD
  })
}

export async function fetchHealthScore(): Promise<number> {
  return withApi('/api/dashboard/health', async () => {
    await delay(150)
    return MOCK_DASHBOARD.healthScore
  })
}
