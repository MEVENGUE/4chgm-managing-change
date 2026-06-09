'use client'

import { useEffect, useState } from 'react'
import { Database, FileText, Boxes, BarChart3, StickyNote, BookOpen } from 'lucide-react'
import { getAllSources, KNOWLEDGE_UPDATED_EVENT, type KnowledgeSource } from '@/services/knowledge'
import { RECOMMENDATIONS } from '@/services/ai'
import { useCopilot } from '@/providers/CopilotProvider'

const TYPE_ICON = {
  document: FileText,
  connector: Boxes,
  report: BarChart3,
  note: StickyNote,
  playbook: BookOpen,
}

const IMPACT_COLOR = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--info)' }

export default function KnowledgePanel() {
  const { sendMessage } = useCopilot()
  const [sources, setSources] = useState<KnowledgeSource[]>([])

  useEffect(() => {
    const refresh = () => setSources(getAllSources())
    refresh()
    window.addEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
  }, [])

  return (
    <div className="space-y-6">
      <div className="glass-panel-strong rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[var(--primary)]" />
          <p className="section-title">Knowledge Engine</p>
          <span className="ml-auto text-[10px] font-semibold text-[var(--text-muted)]">{sources.length} sources</span>
        </div>
        <div className="mt-4 space-y-2">
          {sources.slice(0, 6).map((s) => {
            const Icon = TYPE_ICON[s.type]
            return (
              <div key={s.id} className="flex items-start gap-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-strong)]">
                  <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--text-primary)]">{s.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{s.origin} · indexed</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="glass-panel-strong rounded-3xl p-5">
        <p className="section-title">Suggested actions</p>
        <div className="mt-4 space-y-2.5">
          {RECOMMENDATIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => sendMessage(r.title)}
              className="block w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-left transition hover:border-[var(--border-medium)]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{r.title}</p>
                <span
                  className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                  style={{ color: IMPACT_COLOR[r.impact], background: `color-mix(in srgb, ${IMPACT_COLOR[r.impact]} 14%, transparent)` }}
                >
                  {r.impact}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{r.detail}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
