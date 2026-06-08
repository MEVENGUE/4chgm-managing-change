import { retrieve, summarizeDocument } from '@/services/knowledge'
import type { AiAction, Artifact, KnowledgeRef } from '@/types/copilot'

export type { AiMessage } from '@/types/copilot'

export type AiSuggestion = { id: string; prompt: string; category: string }
export type AiRecommendation = {
  id: string
  title: string
  detail: string
  impact: 'high' | 'medium' | 'low'
  action: string
}

export type EngineContext = {
  orgName?: string
  industry?: string
  goals?: string[]
  workspace?: string
  role?: string
  portfolio?: {
    total: number
    atRisk: number
    avgHealth: number
    overrunPct: number
  }
}

export type EngineResult = {
  content: string
  citations: KnowledgeRef[]
  actions: AiAction[]
  artifact?: Artifact
  contextUsed: string[]
}

export const QUICK_PROMPTS: AiSuggestion[] = [
  { id: '1', prompt: 'Optimize cloud migration to reduce costs', category: 'Cost' },
  { id: '2', prompt: 'Explain our current portfolio risks', category: 'Risk' },
  { id: '3', prompt: 'Summarize Sprint 24 performance', category: 'Agile' },
  { id: '4', prompt: 'Generate a transformation roadmap', category: 'Strategy' },
]

export const RECOMMENDATIONS: AiRecommendation[] = [
  { id: '1', title: 'Rightsize cloud reserved instances', detail: 'Move 3 workloads to reserved capacity — ~$680K/year savings.', impact: 'high', action: 'Simulate savings' },
  { id: '2', title: 'Remediate dependency vulnerabilities', detail: '1 high-severity issue, fixable this sprint.', impact: 'high', action: 'View risks' },
  { id: '3', title: 'Rebalance Sprint 24 scope', detail: '2 stories at risk of slipping.', impact: 'medium', action: 'Open Scrum Hub' },
]

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function citationsText(citations: KnowledgeRef[]): string {
  if (citations.length === 0) return ''
  return ` Drawing on ${citations.map((c) => `"${c.title}"`).join(' and ')},`
}

function intentOf(prompt: string): 'roadmap' | 'sprint' | 'risk' | 'cost' | 'diagram' | 'doc' | 'general' {
  const p = prompt.toLowerCase()
  if (p.includes('diagram') || p.includes('mermaid') || p.includes('architecture diagram') || p.includes('dependency map')) return 'diagram'
  if (p.includes('roadmap') || (p.includes('plan') && (p.includes('generate') || p.includes('build') || p.includes('create')))) return 'roadmap'
  if (p.includes('sprint') || p.includes('velocity') || p.includes('scrum')) return 'sprint'
  if (p.includes('risk') || p.includes('vulnerab') || p.includes('audit')) return 'risk'
  if (p.includes('cost') || p.includes('cloud') || p.includes('budget') || p.includes('saving')) return 'cost'
  if (p.includes('summar') && p.length > 120) return 'doc'
  return 'general'
}

function workspaceLine(ctx: EngineContext): string {
  if (!ctx.workspace) return ''
  return ` In the context of your ${ctx.workspace} workspace${ctx.role ? ` (${ctx.role} view)` : ''},`
}

function portfolioLine(ctx: EngineContext): string {
  const p = ctx.portfolio
  if (!p) return ''
  return ` Live portfolio context: ${p.total} initiatives, ${p.atRisk} at risk, average health ${p.avgHealth}, budget forecast ${p.overrunPct >= 0 ? '+' : ''}${p.overrunPct}% vs plan.`
}

/** Core knowledge-grounded engine. Swap for a real LLM call without UI changes. */
export function generateAnswer(prompt: string, ctx: EngineContext = {}): EngineResult {
  const citations = retrieve(prompt)
  const who = ctx.orgName ? `${ctx.orgName}` : 'your organization'
  const contextUsed = ['Organization profile', ...citations.map((c) => c.title)]
  const intent = intentOf(prompt)

  if (intent === 'diagram') {
    return {
      content: `${citationsText(citations)}${workspaceLine(ctx)} I can render that in Mermaid Studio. Open it and use "From initiatives" to build a live dependency map, or type a prompt like "Generate AWS migration architecture".`,
      citations,
      contextUsed,
      actions: [
        { id: 'a1', label: 'Open Mermaid Studio', kind: 'navigate', payload: '/dashboard/mermaid' },
        { id: 'a2', label: 'Generate roadmap', kind: 'generate', payload: 'Generate a transformation roadmap from my initiatives' },
      ],
    }
  }

  if (intent === 'roadmap') {
    const goals = ctx.goals && ctx.goals.length ? ctx.goals : ['Cloud migration', 'AI adoption', 'Cost reduction']
    return {
      content: `${citationsText(citations)} I generated a phased transformation roadmap for ${who}, sequenced to de-risk delivery while front-loading your priority goal of ${goals[0].toLowerCase()}.`,
      citations,
      contextUsed,
      actions: [
        { id: 'a1', label: 'Open Roadmap', kind: 'navigate', payload: '/dashboard/roadmap' },
        { id: 'a2', label: 'Generate sprint plan', kind: 'generate', payload: 'Summarize Sprint 24 performance' },
      ],
      artifact: {
        type: 'roadmap',
        title: 'AI-generated Transformation Roadmap',
        phases: [
          { name: 'Assess & Align', duration: '4 weeks', focus: 'Baseline, KPIs, stakeholder alignment', progress: 100 },
          { name: 'Foundation', duration: '8 weeks', focus: goals[0], progress: 62 },
          { name: 'Scale', duration: '10 weeks', focus: goals[1] ?? 'Platform rollout', progress: 28 },
          { name: 'Optimize', duration: '6 weeks', focus: 'Cost & value realization', progress: 8 },
        ],
      },
    }
  }

  if (intent === 'sprint') {
    return {
      content: `${citationsText(citations)} here is the Sprint 24 intelligence summary. Velocity is trending up but review cycle time is a bottleneck worth addressing.`,
      citations,
      contextUsed,
      actions: [
        { id: 'a1', label: 'Open Scrum Hub', kind: 'navigate', payload: '/dashboard/scrum' },
        { id: 'a2', label: 'Explain the risks', kind: 'generate', payload: 'Explain our current portfolio risks' },
      ],
      artifact: {
        type: 'sprint',
        title: 'Sprint 24 — Intelligence Summary',
        metrics: [
          { label: 'Completion', value: '68%' },
          { label: 'Velocity', value: '68 pts' },
          { label: 'Trend', value: '+7.3%' },
        ],
        highlights: ['342 / 500 story points delivered', '3-sprint velocity up 7.3%'],
        risks: ['Review cycle time +12%', '2 stories at risk of slipping'],
      },
    }
  }

  if (intent === 'risk') {
    return {
      content: `${citationsText(citations)} I assessed the active risk register for ${who}.${portfolioLine(ctx)} The highest priority is a high-severity dependency vulnerability that is remediable within the current sprint.`,
      citations,
      contextUsed,
      actions: [
        { id: 'a1', label: 'Open Risks & Impact', kind: 'navigate', payload: '/dashboard/risks' },
        { id: 'a2', label: 'Draft mitigation plan', kind: 'generate', payload: 'Generate a transformation roadmap to address risks' },
      ],
      artifact: {
        type: 'risk',
        title: 'Portfolio Risk Assessment',
        items: [
          { name: 'Dependency vulnerabilities', severity: 'high', mitigation: 'Version bumps this sprint + CI scanning' },
          { name: 'ERP schedule slip', severity: 'high', mitigation: 'Add 2 data engineers to governance workstream' },
          { name: 'Cloud cost variance', severity: 'medium', mitigation: 'Reserved instances + dev consolidation' },
        ],
      },
    }
  }

  if (intent === 'cost') {
    return {
      content: `${citationsText(citations)} by consolidating idle compute and moving 3 workloads to reserved instances, ${who} can reduce cloud costs by 18–22% (~$680K/year) without impacting the 99.95% SLA. Non-production clusters are the best place to start.`,
      citations,
      contextUsed,
      actions: [
        { id: 'a1', label: 'Open Cost Forecast', kind: 'navigate', payload: '/dashboard/cost' },
        { id: 'a2', label: 'Build savings roadmap', kind: 'generate', payload: 'Generate a transformation roadmap focused on cost reduction' },
      ],
    }
  }

  return {
    content: `${citationsText(citations)}${workspaceLine(ctx)} here is my analysis for ${who}.${portfolioLine(ctx)} I can turn this into a roadmap, a sprint summary, a risk breakdown, or a Mermaid diagram — just ask.`,
    citations,
    contextUsed,
    actions: [
      { id: 'a1', label: 'Generate roadmap', kind: 'generate', payload: 'Generate a transformation roadmap' },
      { id: 'a2', label: 'Open Analytics', kind: 'navigate', payload: '/dashboard/analytics' },
    ],
  }
}

export function answerForDocument(text: string, ctx: EngineContext = {}): EngineResult {
  const summary = summarizeDocument(text)
  const citations = retrieve(text)
  return {
    content: `Here is my understanding of the document you shared:\n\n${summary}`,
    citations,
    contextUsed: ['Document understanding', ...citations.map((c) => c.title)],
    actions: [
      { id: 'a1', label: 'Extract action items', kind: 'generate', payload: 'What are the key risks and action items in that document?' },
    ],
  }
}

/** Streams the textual part word-by-word; structured fields are applied at completion. */
export async function* streamAnswerText(content: string): AsyncGenerator<string> {
  await delay(420)
  const words = content.split(' ')
  let acc = ''
  for (const w of words) {
    acc += (acc ? ' ' : '') + w
    yield acc
    await delay(22)
  }
}
