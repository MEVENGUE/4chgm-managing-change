'use client'

import type { PipelineStage } from '@/types/dashboard'

const DEFAULT: PipelineStage[] = [
  { id: '1', name: 'Code Commit', status: 'done', time: '2m ago' },
  { id: '2', name: 'Build', status: 'done', time: '4m ago' },
  { id: '3', name: 'Tests', status: 'done', time: '6m ago' },
  { id: '4', name: 'Security Scan', status: 'done', time: '7m ago' },
  { id: '5', name: 'Deploy', status: 'active', time: 'In progress' },
  { id: '6', name: 'Monitor', status: 'pending', time: 'Live' },
]

const statusColor = {
  done: 'bg-[var(--success)]',
  active: 'bg-[var(--secondary)] animate-pulse-soft',
  pending: 'bg-[var(--text-muted)]',
}

type Props = {
  stages?: PipelineStage[]
}

export default function DevOpsPipeline({ stages = DEFAULT }: Props) {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <p className="section-title">DevOps Pipeline</p>
        <span className="rounded-full border border-[var(--success)]/30 bg-[var(--success-muted)] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--success)]">PRODUCTION</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {stages.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 transition hover:border-[var(--border-medium)]">
            <div className="flex items-center gap-2.5">
              <div className={`h-2 w-2 rounded-full ${statusColor[item.status]}`} />
              <p className="text-xs font-medium text-[var(--text-secondary)]">{item.name}</p>
            </div>
            {item.time && <span className="text-[10px] font-medium text-[var(--text-muted)]">{item.time}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
