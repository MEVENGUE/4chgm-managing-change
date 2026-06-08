'use client'

const phases = [
  { name: 'Assessment', color: '#06b6d4' },
  { name: 'Strategy', color: '#8b5cf6' },
  { name: 'Implementation', color: '#f59e0b' },
  { name: 'Migration', color: '#10b981' },
  { name: 'Optimization', color: '#3b82f6' },
]

export default function RoadmapTimeline() {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">Roadmap Timeline</p>
      <div className="mt-5 space-y-3">
        {phases.map((phase, index) => (
          <div key={phase.name} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-medium)]" style={{ backgroundColor: phase.color + '20' }}>
              <span className="text-[10px] font-bold" style={{ color: phase.color }}>{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">{phase.name}</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${60 + index * 10}%`, backgroundColor: phase.color + '90' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
