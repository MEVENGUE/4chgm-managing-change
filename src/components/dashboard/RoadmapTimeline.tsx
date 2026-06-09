'use client'

import type { RoadmapSnapshot } from '@/lib/intelligence'

const PHASE_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']

type Props = {
  roadmap?: RoadmapSnapshot
}

export default function RoadmapTimeline({ roadmap = [] }: Props) {
  const phases =
    roadmap.length > 0
      ? roadmap.map((r, index) => ({
          name: r.phase,
          progress: r.avgProgress,
          count: r.count,
          color: PHASE_COLORS[index % PHASE_COLORS.length],
        }))
      : [{ name: 'No phases yet', progress: 0, count: 0, color: '#64748b' }]

  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">Roadmap Timeline</p>
      <div className="mt-5 space-y-3">
        {phases.map((phase, index) => (
          <div key={`${phase.name}-${index}`} className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-medium)]"
              style={{ backgroundColor: phase.color + '20' }}
            >
              <span className="text-[10px] font-bold" style={{ color: phase.color }}>
                {index + 1}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{phase.name}</p>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {phase.count} initiative{phase.count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(phase.progress, 4)}%`, backgroundColor: phase.color + '90' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
