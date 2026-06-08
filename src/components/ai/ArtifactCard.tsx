'use client'

import { Map, Gauge, ShieldAlert, Sparkles } from 'lucide-react'
import type { Artifact } from '@/types/copilot'

const SEVERITY: Record<'high' | 'medium' | 'low', string> = {
  high: 'var(--danger)',
  medium: 'var(--warning)',
  low: 'var(--info)',
}

export default function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const Icon = artifact.type === 'roadmap' ? Map : artifact.type === 'sprint' ? Gauge : ShieldAlert

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--primary)]/10 to-transparent px-4 py-2.5">
        <Icon className="h-4 w-4 text-[var(--primary)]" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">{artifact.title}</span>
        <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[var(--primary)]">
          <Sparkles className="h-3 w-3" /> AI generated
        </span>
      </div>

      <div className="p-4">
        {artifact.type === 'roadmap' && (
          <div className="space-y-3">
            {artifact.phases.map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">{p.name}</span>
                  <span className="text-[var(--text-muted)]">{p.duration}</span>
                </div>
                <p className="mb-1.5 text-[11px] text-[var(--text-muted)]">{p.focus}</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {artifact.type === 'sprint' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {artifact.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-strong)] p-2.5 text-center">
                  <p className="text-base font-bold text-[var(--text-primary)]">{m.value}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--success)]">Highlights</p>
                {artifact.highlights.map((h) => (
                  <p key={h} className="text-[11px] text-[var(--text-secondary)]">• {h}</p>
                ))}
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--warning)]">Risks</p>
                {artifact.risks.map((r) => (
                  <p key={r} className="text-[11px] text-[var(--text-secondary)]">• {r}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {artifact.type === 'risk' && (
          <div className="space-y-2.5">
            {artifact.items.map((item) => (
              <div key={item.name} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-strong)] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{item.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                    style={{ color: SEVERITY[item.severity], background: `color-mix(in srgb, ${SEVERITY[item.severity]} 14%, transparent)` }}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{item.mitigation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
