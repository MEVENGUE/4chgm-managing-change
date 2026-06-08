export type WidgetId =
  | 'kpis'
  | 'globe'
  | 'ai-assistant'
  | 'system-status'
  | 'insights'
  | 'initiatives'
  | 'roadmap'
  | 'collaboration'

export type WidgetLayout = {
  order: WidgetId[]
  hidden: WidgetId[]
}

export const DEFAULT_WIDGET_LAYOUT: WidgetLayout = {
  order: ['kpis', 'globe', 'ai-assistant', 'system-status', 'insights', 'initiatives', 'roadmap', 'collaboration'],
  hidden: [],
}

export const WIDGET_LABELS: Record<WidgetId, string> = {
  kpis: 'KPI Overview',
  globe: 'Transformation Globe',
  'ai-assistant': 'AI Assistant',
  'system-status': 'System Status',
  insights: 'AI Insight Feed',
  initiatives: 'Initiatives Panel',
  roadmap: 'Roadmap Timeline',
  collaboration: 'Collaboration',
}

export function layoutStorageKey(workspaceId: string) {
  return `4chgm-layout-${workspaceId}`
}
