export type RoadmapPhase = {
  id: string
  name: string
  start: string
  end: string
  progress: number
  color: string
}

const MOCK_PHASES: RoadmapPhase[] = [
  { id: '1', name: 'Assessment', start: 'May', end: 'Jun', progress: 100, color: 'var(--success)' },
  { id: '2', name: 'Strategy', start: 'Jun', end: 'Jul', progress: 85, color: 'var(--primary)' },
  { id: '3', name: 'Design', start: 'Jul', end: 'Aug', progress: 60, color: 'var(--secondary)' },
  { id: '4', name: 'Implementation', start: 'Aug', end: 'Oct', progress: 35, color: 'var(--warning)' },
  { id: '5', name: 'Migration', start: 'Oct', end: 'Nov', progress: 10, color: 'var(--info)' },
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchRoadmapPhases(): Promise<RoadmapPhase[]> {
  await delay(200)
  return MOCK_PHASES
}
