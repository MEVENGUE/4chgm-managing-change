export type WorkspaceView = 'executive' | 'engineering' | 'transformation' | 'finance'

export type Workspace = {
  id: string
  name: string
  view: WorkspaceView
  role: string
  department: string
  accent: string
}

export const WORKSPACES: Workspace[] = [
  { id: 'exec', name: 'Executive Office', view: 'executive', role: 'Executive', department: 'Leadership', accent: '#7c5cff' },
  { id: 'transformation', name: 'Transformation Office', view: 'transformation', role: 'Change Lead', department: 'Transformation', accent: '#00d4ff' },
  { id: 'engineering', name: 'Engineering', view: 'engineering', role: 'Engineering', department: 'Engineering', accent: '#22c55e' },
  { id: 'product', name: 'Product', view: 'transformation', role: 'Product', department: 'Product', accent: '#ec4899' },
  { id: 'cloudops', name: 'Cloud Operations', view: 'engineering', role: 'Cloud Ops', department: 'Operations', accent: '#f59e0b' },
  { id: 'finance', name: 'Finance', view: 'finance', role: 'Finance', department: 'Finance', accent: '#14b8a6' },
  { id: 'security', name: 'Security', view: 'engineering', role: 'Security', department: 'Security', accent: '#ef4444' },
]

export const VIEW_LABEL: Record<WorkspaceView, string> = {
  executive: 'Executive Intelligence',
  engineering: 'Engineering Operations',
  transformation: 'Transformation Office',
  finance: 'Financial Control',
}
