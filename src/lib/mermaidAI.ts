import type { Initiative } from '@/types/projects'
import { MERMAID_TEMPLATES } from '@/lib/mermaidTemplates'

export type MermaidGenResult = { code: string; note: string }

export const AI_PROMPT_SUGGESTIONS = [
  'Generate AWS migration architecture',
  'Generate a Scrum workflow',
  'Generate a DevOps CI/CD pipeline',
  'Generate a transformation roadmap',
  'Generate a dependency map from my initiatives',
  'Generate an org chart',
]

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_')
}

function fromTemplate(id: string): string {
  return MERMAID_TEMPLATES.find((t) => t.id === id)?.code ?? MERMAID_TEMPLATES[0].code
}

/** Build a live dependency map from the actual portfolio. */
export function mermaidFromInitiatives(initiatives: Initiative[]): string {
  if (initiatives.length === 0) return fromTemplate('transformation')
  const lines: string[] = ['graph LR']
  lines.push('  classDef ontrack fill:#10271a,stroke:#22c55e,color:#e7ffef;')
  lines.push('  classDef atrisk fill:#2a1414,stroke:#ef4444,color:#ffe7e7;')
  lines.push('  classDef planning fill:#101a2e,stroke:#3b82f6,color:#e7f0ff;')
  lines.push('  classDef done fill:#1a1430,stroke:#7c5cff,color:#efe9ff;')

  const cls = (i: Initiative) =>
    i.status === 'at-risk' ? 'atrisk' : i.status === 'completed' ? 'done' : i.status === 'planning' || i.status === 'on-hold' ? 'planning' : 'ontrack'

  for (const i of initiatives) {
    const id = sanitize(i.id)
    lines.push(`  ${id}["${i.name}\\n${i.progress}% · risk ${i.riskScore}"]:::${cls(i)}`)
  }
  for (const i of initiatives) {
    for (const dep of i.dependencies) {
      if (initiatives.some((x) => x.id === dep)) lines.push(`  ${sanitize(dep)} --> ${sanitize(i.id)}`)
    }
  }
  return lines.join('\n')
}

function roadmapFromInitiatives(initiatives: Initiative[]): string {
  if (initiatives.length === 0) return fromTemplate('roadmap')
  const byPhase = new Map<string, Initiative[]>()
  for (const i of initiatives) {
    const arr = byPhase.get(i.phase) ?? []
    arr.push(i)
    byPhase.set(i.phase, arr)
  }
  const lines = ['journey', '  title Live Transformation Roadmap']
  for (const [phase, items] of byPhase) {
    lines.push(`  section ${phase}`)
    for (const i of items) {
      const score = Math.max(1, Math.min(5, Math.round(i.progress / 20)))
      lines.push(`    ${i.name}: ${score}: ${i.owner}`)
    }
  }
  return lines.join('\n')
}

/** Routes a natural-language prompt to Mermaid syntax, using live data when relevant. */
export function generateMermaid(prompt: string, ctx?: { initiatives?: Initiative[] }): MermaidGenResult {
  const p = prompt.toLowerCase()
  const initiatives = ctx?.initiatives ?? []

  if (p.includes('dependency') || p.includes('initiative') || p.includes('portfolio') || p.includes('my project')) {
    return { code: mermaidFromInitiatives(initiatives), note: `Dependency map generated from ${initiatives.length} live initiatives.` }
  }
  if (p.includes('roadmap') || p.includes('transformation')) {
    if (initiatives.length > 0 && (p.includes('my') || p.includes('live') || p.includes('initiative')))
      return { code: roadmapFromInitiatives(initiatives), note: 'Roadmap generated from your live portfolio.' }
    return { code: fromTemplate('transformation'), note: 'Transformation flow generated.' }
  }
  if (p.includes('aws') || p.includes('cloud') || p.includes('architecture')) return { code: fromTemplate('architecture'), note: 'Cloud architecture generated.' }
  if (p.includes('scrum') || p.includes('agile') || p.includes('sprint')) return { code: fromTemplate('scrum'), note: 'Scrum workflow generated.' }
  if (p.includes('devops') || p.includes('ci') || p.includes('cd') || p.includes('pipeline')) return { code: fromTemplate('devops'), note: 'DevOps pipeline generated.' }
  if (p.includes('sequence') || p.includes('auth') || p.includes('login')) return { code: fromTemplate('sequence'), note: 'Sequence diagram generated.' }
  if (p.includes('org') || p.includes('team') || p.includes('hierarchy')) {
    return {
      code: `graph TD\n  CEO[CEO]\n  CTO[CTO]\n  CFO[CFO]\n  CISO[CISO]\n  CEO --> CTO\n  CEO --> CFO\n  CEO --> CISO\n  CTO --> ENG[Engineering]\n  CTO --> PRD[Product]\n  CFO --> FIN[Finance]\n  CISO --> SEC[Security]`,
      note: 'Org chart generated.',
    }
  }
  return { code: fromTemplate('transformation'), note: 'Generated a transformation flow. Try mentioning cloud, scrum, devops, roadmap or dependency map.' }
}

export function explainMermaid(code: string): string {
  const lines = code.split('\n').map((l) => l.trim()).filter(Boolean)
  const header = (lines[0] || '').toLowerCase()
  const type = header.startsWith('sequence')
    ? 'sequence diagram'
    : header.startsWith('journey')
      ? 'user journey'
      : header.startsWith('graph td')
        ? 'top-down flowchart'
        : header.startsWith('graph lr')
          ? 'left-right flowchart'
          : 'diagram'
  const edges = lines.filter((l) => l.includes('-->') || l.includes('->>')).length
  const nodes = lines.filter((l) => /\[.*\]|\(.*\)|\{.*\}/.test(l)).length
  return `This is a ${type} with roughly ${nodes} nodes and ${edges} connections. ${
    edges > nodes ? 'It is densely connected — consider grouping related nodes into subgraphs for clarity.' : 'The structure is clean and readable.'
  }`
}
