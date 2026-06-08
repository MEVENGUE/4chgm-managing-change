'use client'

import type { CollaborationEvent } from '@/types/dashboard'

const DEFAULT: CollaborationEvent[] = [
  { id: '1', user: 'Alex Johnson', action: 'updated the roadmap', time: '2m ago' },
  { id: '2', user: 'Sarah Chen', action: 'commented on Sprint 24', time: '8m ago' },
  { id: '3', user: 'System', action: 'deployment succeeded for main branch', time: '15m ago' },
  { id: '4', user: 'Mike Ross', action: 'assigned new risk to Azure Migration', time: '32m ago' },
]

type Props = {
  events?: CollaborationEvent[]
}

export default function CollaborationPanel({ events = DEFAULT }: Props) {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">Team Collaboration</p>
      <div className="mt-4 space-y-2.5">
        {events.map((activity) => (
          <div key={activity.id} className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 transition hover:border-[var(--border-medium)]">
            <p className="text-xs text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)] transition">{activity.user}</span>{' '}
              {activity.action}
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
