import type { KnowledgeRef } from '@/types/copilot'

export type KnowledgeSource = {
  id: string
  title: string
  type: 'document' | 'connector' | 'report' | 'note' | 'playbook'
  origin: string
  content: string
  tags: string[]
  ingestedAt: string
}

export type Playbook = {
  id: string
  title: string
  category: string
  steps: string[]
  tags: string[]
}

/**
 * Seed enterprise knowledge base. In production these documents would be chunked
 * and embedded into a vector store; here we keep raw text and score with token
 * overlap. The retrieve() interface is intentionally vector-ready.
 */
const SEED_SOURCES: KnowledgeSource[] = [
  {
    id: 'cloud-plan',
    title: 'Cloud Migration Plan — Phase 2',
    type: 'document',
    origin: 'Confluence',
    content:
      'Phase 2 migrates 14 workloads to AWS and Azure. Current spend is tracking 15% above the Q3 forecast, driven by idle compute in non-production clusters. Recommended: move 3 workloads to reserved instances and consolidate dev environments. Estimated savings 18-22% (~$680K/year). SLA target 99.95% must be preserved.',
    tags: ['cloud', 'cost', 'migration', 'aws', 'azure'],
    ingestedAt: '2026-05-12',
  },
  {
    id: 'q3-budget',
    title: 'Q3 Budget & Forecast',
    type: 'report',
    origin: 'SAP',
    content:
      'Total transformation budget for Q3 is $4.2M with $2.48M realized savings YTD. Cloud is the largest line item. Budget approved by the Strategic Director. Cost variance flagged on ERP and Cloud workstreams.',
    tags: ['budget', 'cost', 'finance', 'q3', 'forecast'],
    ingestedAt: '2026-05-30',
  },
  {
    id: 'sprint-24',
    title: 'Sprint 24 Report',
    type: 'report',
    origin: 'Jira',
    content:
      'Sprint 24 completed 342 of 500 story points (68%). Velocity up 7.3% over the last 3 sprints, averaging 68 points. Cycle time on code review increased 12%. Two stories at risk of slipping. Adding a reviewer or parallel reviews could unlock ~8% capacity.',
    tags: ['sprint', 'agile', 'velocity', 'scrum', 'delivery'],
    ingestedAt: '2026-06-02',
  },
  {
    id: 'security-audit',
    title: 'Security & Dependency Audit',
    type: 'document',
    origin: 'GitHub',
    content:
      'Audit detected vulnerabilities in 3 third-party dependencies, 1 high severity. All are remediable within the current sprint via version bumps. No data exposure detected. Recommend enabling automated dependency scanning in CI.',
    tags: ['security', 'risk', 'dependencies', 'devops', 'vulnerability'],
    ingestedAt: '2026-06-04',
  },
  {
    id: 'erp-charter',
    title: 'ERP Modernization Charter',
    type: 'document',
    origin: 'Notion',
    content:
      'ERP modernization is at 45% progress and flagged at-risk due to resourcing gaps in the data governance workstream. Schedule risk is elevated. Stakeholder engagement improved to 82%. Mitigation requires 2 additional data engineers.',
    tags: ['erp', 'risk', 'governance', 'transformation', 'resourcing'],
    ingestedAt: '2026-05-20',
  },
]

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-adkar',
    title: 'ADKAR Change Model Rollout',
    category: 'Change Management',
    steps: ['Assess Awareness gaps', 'Build Desire through sponsorship', 'Deliver Knowledge training', 'Enable Ability with coaching', 'Reinforce with metrics'],
    tags: ['adkar', 'change', 'transformation', 'people'],
  },
  {
    id: 'pb-cloud',
    title: 'Cloud Migration Wave Planning',
    category: 'Cloud & DevOps',
    steps: ['Inventory workloads', 'Define landing zones', 'Establish CI/CD guardrails', 'Migrate wave 1 (low risk)', 'Validate observability & cost baselines'],
    tags: ['cloud', 'migration', 'devops', 'observability'],
  },
  {
    id: 'pb-erp',
    title: 'ERP Cutover Readiness',
    category: 'Program Governance',
    steps: ['Freeze scope', 'Run dress rehearsal', 'Validate data reconciliation', 'Activate war room', 'Hypercare for 30 days'],
    tags: ['erp', 'cutover', 'governance', 'risk'],
  },
  {
    id: 'pb-ai',
    title: 'AI Adoption Playbook',
    category: 'AI & Data',
    steps: ['Identify high-ROI use cases', 'Establish data governance', 'Pilot with human-in-the-loop', 'Measure adoption & drift', 'Scale with guardrails'],
    tags: ['ai', 'adoption', 'governance', 'data'],
  },
]

const STORAGE_KEY = '4chgm-knowledge'

function loadIngested(): KnowledgeSource[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as KnowledgeSource[]) : []
  } catch {
    return []
  }
}

function persistIngested(sources: KnowledgeSource[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources))
  } catch {
    /* ignore */
  }
}

export function getAllSources(): KnowledgeSource[] {
  return [...SEED_SOURCES, ...loadIngested()]
}

const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'for', 'in', 'on', 'is', 'are', 'with', 'my', 'our', 'me', 'how', 'what', 'can', 'you', 'i'])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t))
}

/**
 * Vector-ready retrieval. Swap this body for an embeddings + cosine similarity
 * lookup without changing any caller. Returns the most relevant snippets.
 */
export function retrieve(query: string, topK = 3): KnowledgeRef[] {
  const q = tokenize(query)
  if (q.length === 0) return []
  const sources = getAllSources()

  const scored = sources.map((s) => {
    const haystack = tokenize(`${s.title} ${s.content} ${s.tags.join(' ')}`)
    const hay = new Set(haystack)
    let overlap = 0
    for (const term of q) if (hay.has(term)) overlap += 1
    // Normalize toward a 0..1 relevance, mimicking cosine similarity
    const score = overlap / Math.sqrt(q.length * Math.max(1, new Set(haystack).size / 6))
    return { source: s, score }
  })

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => ({
      sourceId: r.source.id,
      title: r.source.title,
      snippet: r.source.content.slice(0, 160) + (r.source.content.length > 160 ? '…' : ''),
      score: Math.min(0.99, Number(r.score.toFixed(2))),
    }))
}

export function ingestDocument(title: string, content: string, origin = 'Upload'): KnowledgeSource {
  const doc: KnowledgeSource = {
    id: `doc-${Date.now()}`,
    title,
    type: 'note',
    origin,
    content,
    tags: tokenize(`${title} ${content}`).slice(0, 6),
    ingestedAt: new Date().toISOString().slice(0, 10),
  }
  const ingested = loadIngested()
  const next = [doc, ...ingested].slice(0, 25)
  persistIngested(next)
  return doc
}

/** Lightweight extractive summary for document understanding. */
/** Mock semantic search — returns scored documents + playbooks. */
export function semanticSearch(query: string, topK = 8): { sources: KnowledgeSource[]; playbooks: Playbook[]; score: number }[] {
  const q = tokenize(query)
  if (q.length === 0) return []
  const results: { sources: KnowledgeSource[]; playbooks: Playbook[]; score: number }[] = []

  for (const s of getAllSources()) {
    const hay = tokenize(`${s.title} ${s.content} ${s.tags.join(' ')}`)
    const haySet = new Set(hay)
    let overlap = 0
    for (const term of q) if (haySet.has(term)) overlap += 1
    const score = overlap / Math.sqrt(q.length * Math.max(1, haySet.size / 5))
    if (score > 0) results.push({ sources: [s], playbooks: [], score })
  }

  for (const p of PLAYBOOKS) {
    const hay = tokenize(`${p.title} ${p.category} ${p.steps.join(' ')} ${p.tags.join(' ')}`)
    const haySet = new Set(hay)
    let overlap = 0
    for (const term of q) if (haySet.has(term)) overlap += 1
    const score = overlap / Math.sqrt(q.length * Math.max(1, haySet.size / 4))
    if (score > 0) results.push({ sources: [], playbooks: [p], score })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}

/** AI-style recommendations based on query context. */
export function recommendKnowledge(recentQuery = 'transformation risk budget'): { label: string; href: string }[] {
  const hits = semanticSearch(recentQuery, 3)
  const recs: { label: string; href: string }[] = hits.flatMap((h) => {
    if (h.playbooks[0]) return [{ label: h.playbooks[0].title, href: '#playbooks' }]
    if (h.sources[0]) return [{ label: h.sources[0].title, href: '#documents' }]
    return []
  })
  if (recs.length < 3) {
    recs.push({ label: 'ADKAR Change Model Rollout', href: '#playbooks' })
    recs.push({ label: 'Cloud Migration Plan — Phase 2', href: '#documents' })
  }
  return recs.slice(0, 4)
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const s of getAllSources()) for (const t of s.tags) tags.add(t)
  for (const p of PLAYBOOKS) for (const t of p.tags) tags.add(t)
  return Array.from(tags).sort()
}

export function summarizeDocument(content: string): string {
  const sentences = content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
  if (sentences.length <= 2) return content.trim()
  const q = tokenize(content)
  const freq: Record<string, number> = {}
  for (const t of q) freq[t] = (freq[t] ?? 0) + 1
  const ranked = sentences
    .map((s) => ({ s, score: tokenize(s).reduce((sum, t) => sum + (freq[t] ?? 0), 0) / Math.max(1, tokenize(s).length) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.s.trim())
  // Preserve original order
  return sentences.filter((s) => ranked.includes(s.trim())).join(' ')
}
