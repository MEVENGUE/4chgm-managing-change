'use client'

type Props = {
  healthScore?: number
}

export default function SystemStatus({ healthScore = 98.6 }: Props) {
  return (
    <div className="glass-panel-strong rounded-3xl p-6">
      <p className="section-title">System Health</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--border-medium)]" />
            <circle
              cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2"
              strokeDasharray={`${healthScore}, 100`} strokeLinecap="round"
              className="text-[var(--success)]"
            />
          </svg>
          <span className="text-lg font-bold text-[var(--success)]">{healthScore}%</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">All Systems Operational</p>
          <p className="text-[10px] text-[var(--text-muted)]">Last check: just now</p>
        </div>
      </div>
    </div>
  )
}
