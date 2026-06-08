'use client'

import type { Insight } from '@/types/dashboard'

const PRIORITY_COLORS = {
  high: 'var(--danger)',
  medium: 'var(--warning)',
  low: 'var(--info)',
}

const DEFAULT: Insight[] = [
  { id: '1', text: 'Cloud costs can be reduced by 18–22% based on current usage patterns.', priority: 'high', tag: 'High Impact' },
  { id: '2', text: 'Team velocity is optimal for this sprint cycle.', priority: 'low', tag: 'Info' },
  { id: '3', text: 'Security risk detected in 3 dependencies. Review recommended.', priority: 'medium', tag: 'Medium Risk' },
]

type Props = {
  insights?: Insight[]
}

export default function InsightsPanel({ insights = DEFAULT }: Props) {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">Recent Insights</p>
      <div className="mt-4 space-y-3">
        {insights.map((item) => {
          const color = PRIORITY_COLORS[item.priority]
          return (
            <div key={item.id} className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--border-medium)]">
              <div className="flex items-start justify-between">
                <p className="flex-1 text-xs text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--text-secondary)] transition">{item.text}</p>
                <span
                  className="ml-3 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 20%, transparent)` }}
                >
                  {item.tag}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
