'use client'

import type { SprintData } from '@/types/dashboard'

const DEFAULT: SprintData = {
  name: 'Sprint 24',
  progress: 68,
  storyPoints: { done: 342, total: 500 },
  tasksCompleted: 24,
  tasksTotal: 36,
}

type Props = {
  sprint?: SprintData
}

export default function SprintProgress({ sprint = DEFAULT }: Props) {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">{sprint.name} Progress</p>
      <div className="mt-5 flex items-center gap-5">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--border-medium)]" />
            <circle
              cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeDasharray={`${sprint.progress}, 100`} strokeLinecap="round"
              className="text-[var(--secondary)]"
            />
          </svg>
          <span className="text-xl font-bold text-[var(--text-primary)]">{sprint.progress}%</span>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Story Points</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{sprint.storyPoints.done} / {sprint.storyPoints.total}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Tasks</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{sprint.tasksCompleted} / {sprint.tasksTotal}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
