export type KpiMetric = {
  id: string
  title: string
  value: string | number
  change?: string
  suffix?: string
  trend?: number[]
  trendTone?: 'primary' | 'secondary' | 'success' | 'warning'
}

export type Insight = {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  tag: string
}

export type Initiative = {
  id: string
  name: string
  progress: number
  status: 'on-track' | 'at-risk' | 'completed'
}

export type CollaborationEvent = {
  id: string
  user: string
  action: string
  time: string
  avatar?: string
}

export type PipelineStage = {
  id: string
  name: string
  status: 'done' | 'active' | 'pending'
  time?: string
}

export type SprintData = {
  name: string
  progress: number
  storyPoints: { done: number; total: number }
  tasksCompleted: number
  tasksTotal: number
}

export type ImpactSegment = {
  label: string
  value: number
  color: string
}

export type TransformationOverview = {
  peopleImpacted: number
  projectsOnTrack: number
  projectsTotal: number
  atRisk: number
  completed: number
  impactDistribution: ImpactSegment[]
}

export type DashboardData = {
  kpis: KpiMetric[]
  overview: TransformationOverview
  insights: Insight[]
  initiatives: Initiative[]
  collaboration: CollaborationEvent[]
  sprint: SprintData
  pipeline: PipelineStage[]
  healthScore: number
}
