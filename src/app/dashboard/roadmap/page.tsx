'use client'

import { useEffect, useState } from 'react'
import { Map } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import { fetchRoadmapPhases, type RoadmapPhase } from '@/services/roadmap'

const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

export default function RoadmapPage() {
  const [phases, setPhases] = useState<RoadmapPhase[]>([])

  useEffect(() => {
    fetchRoadmapPhases().then(setPhases)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader icon={Map} title="Roadmap Timeline" subtitle="Phased transformation plan and delivery progress" />

      <MotionCard delay={0.05}>
        <div className="glass-panel-strong rounded-3xl p-6">
          <div className="mb-4 grid grid-cols-7 gap-2 border-b border-[var(--border-subtle)] pb-2">
            {MONTHS.map((m) => (
              <span key={m} className="text-center text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{m}</span>
            ))}
          </div>
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const start = MONTHS.indexOf(phase.start)
              const end = MONTHS.indexOf(phase.end)
              const left = (Math.max(0, start) / MONTHS.length) * 100
              const width = (((end < 0 ? start + 1 : end) - Math.max(0, start) + 1) / MONTHS.length) * 100
              return (
                <div key={phase.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{phase.name}</span>
                    <span className="text-xs font-semibold" style={{ color: phase.color }}>{phase.progress}%</span>
                  </div>
                  <div className="relative h-7 w-full rounded-full bg-[var(--bg-surface)]">
                    <div
                      className="absolute top-0 flex h-7 items-center rounded-full transition-all duration-700"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: `linear-gradient(90deg, ${phase.color}, color-mix(in srgb, ${phase.color} 50%, transparent))`,
                        boxShadow: `0 0 16px -4px ${phase.color}`,
                        animationDelay: `${index * 80}ms`,
                      }}
                    >
                      <span className="ml-3 text-[10px] font-bold text-white/90">{phase.progress}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {phases.length === 0 && <div className="h-40 animate-pulse-soft rounded-xl bg-[var(--bg-surface)]" />}
          </div>
        </div>
      </MotionCard>
    </div>
  )
}
