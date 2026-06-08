export type StageStatus = 'done' | 'active' | 'pending' | 'error'

export type PipelineStage = { name: string; status: StageStatus }

export type Pipeline = {
  id: string
  source: string
  accent: string
  status: 'healthy' | 'running' | 'attention'
  schedule: string
  lastRun: string
  records: number
  stages: PipelineStage[]
}

export const PIPELINE_STAGE_ORDER = ['Extract', 'Map', 'Validate', 'Transform', 'Load'] as const

export const PIPELINES: Pipeline[] = [
  {
    id: 'jira',
    source: 'Jira',
    accent: '#2684ff',
    status: 'healthy',
    schedule: 'Every 15 min',
    lastRun: '2m ago',
    records: 12840,
    stages: [
      { name: 'Extract', status: 'done' },
      { name: 'Map', status: 'done' },
      { name: 'Validate', status: 'done' },
      { name: 'Transform', status: 'done' },
      { name: 'Load', status: 'done' },
    ],
  },
  {
    id: 'github',
    source: 'GitHub',
    accent: '#8b5cf6',
    status: 'running',
    schedule: 'Real-time',
    lastRun: 'now',
    records: 5310,
    stages: [
      { name: 'Extract', status: 'done' },
      { name: 'Map', status: 'done' },
      { name: 'Validate', status: 'active' },
      { name: 'Transform', status: 'pending' },
      { name: 'Load', status: 'pending' },
    ],
  },
  {
    id: 'sap',
    source: 'SAP',
    accent: '#0faaff',
    status: 'healthy',
    schedule: 'Daily 02:00',
    lastRun: '6h ago',
    records: 48210,
    stages: [
      { name: 'Extract', status: 'done' },
      { name: 'Map', status: 'done' },
      { name: 'Validate', status: 'done' },
      { name: 'Transform', status: 'done' },
      { name: 'Load', status: 'done' },
    ],
  },
  {
    id: 'notion',
    source: 'Notion',
    accent: '#9ca3af',
    status: 'attention',
    schedule: 'Hourly',
    lastRun: 'failed 1h ago',
    records: 0,
    stages: [
      { name: 'Extract', status: 'error' },
      { name: 'Map', status: 'pending' },
      { name: 'Validate', status: 'pending' },
      { name: 'Transform', status: 'pending' },
      { name: 'Load', status: 'pending' },
    ],
  },
]

export type FieldMapping = { id: string; source: string; sample: string; target: string }

export const CANONICAL_FIELDS = ['Initiative', 'Status', 'Owner', 'Due Date', 'Story Points', 'Risk', 'Budget', 'Ignore']

export const SAMPLE_MAPPING: FieldMapping[] = [
  { id: '1', source: 'summary', sample: 'Migrate payment service', target: 'Initiative' },
  { id: '2', source: 'status', sample: 'In Progress', target: 'Status' },
  { id: '3', source: 'assignee.displayName', sample: 'Alex Johnson', target: 'Owner' },
  { id: '4', source: 'duedate', sample: '2026-09-30', target: 'Due Date' },
  { id: '5', source: 'customfield_10016', sample: '8', target: 'Story Points' },
  { id: '6', source: 'priority.name', sample: 'High', target: 'Risk' },
]
