'use client'

const actions = [
  'New Project',
  'AI Analysis',
  'Generate Report',
  'Create Diagram',
  'Cost Simulator',
  'Risk Assessment',
  'Team Survey',
  'More Tools',
]

export default function QuickActions() {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">Quick Actions</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {actions.map((item) => (
          <button
            key={item}
            className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-3 text-left text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
