export type KnowledgeRef = {
  sourceId: string
  title: string
  snippet: string
  score: number
}

export type AiActionKind = 'navigate' | 'generate' | 'open'

export type AiAction = {
  id: string
  label: string
  kind: AiActionKind
  payload: string
}

export type RoadmapArtifact = {
  type: 'roadmap'
  title: string
  phases: { name: string; duration: string; focus: string; progress: number }[]
}

export type SprintArtifact = {
  type: 'sprint'
  title: string
  metrics: { label: string; value: string }[]
  highlights: string[]
  risks: string[]
}

export type RiskArtifact = {
  type: 'risk'
  title: string
  items: { name: string; severity: 'high' | 'medium' | 'low'; mitigation: string }[]
}

export type Artifact = RoadmapArtifact | SprintArtifact | RiskArtifact

export type AiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: KnowledgeRef[]
  actions?: AiAction[]
  artifact?: Artifact
  contextUsed?: string[]
}

export type AiThread = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: AiMessage[]
}
