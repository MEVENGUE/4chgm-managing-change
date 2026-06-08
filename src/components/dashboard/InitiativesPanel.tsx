'use client'

import type { Initiative } from '@/types/dashboard'

const STATUS_MAP = {
  'on-track': { label: 'On Track', color: 'var(--success)' },
  'at-risk': { label: 'At Risk', color: 'var(--warning)' },
  completed: { label: 'Completed', color: 'var(--info)' },
}

const DEFAULT: Initiative[] = [
  { id: '1', name: 'Azure Migration Program', progress: 75, status: 'on-track' },
  { id: '2', name: 'Agile Transformation', progress: 60, status: 'at-risk' },
  { id: '3', name: 'DevSecOps Implementation', progress: 90, status: 'on-track' },
  { id: '4', name: 'Data Platform Modernization', progress: 45, status: 'on-track' },
]

type Props = {
  initiatives?: Initiative[]
}

export default function InitiativesPanel({ initiatives = DEFAULT }: Props) {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">Active Initiatives</p>
      <div className="mt-4 space-y-3">
        {initiatives.map((item) => {
          const { label, color } = STATUS_MAP[item.status]
          return (
            <div key={item.id} className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--border-medium)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)] transition">{item.name}</p>
                <span
                  className="rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 20%, transparent)` }}
                >
                  {label}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.progress}%`, backgroundColor: `color-mix(in srgb, ${color} 60%, transparent)` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
