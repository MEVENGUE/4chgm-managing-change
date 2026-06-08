'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import CollaborationPanel from '@/components/dashboard/CollaborationPanel'
import { fetchDashboardData } from '@/services/dashboard'
import type { CollaborationEvent } from '@/types/dashboard'

const CULTURE = [
  { label: 'Engagement', value: 82 },
  { label: 'Adoption Rate', value: 74 },
  { label: 'Satisfaction', value: 88 },
  { label: 'Readiness', value: 69 },
]

export default function TeamPage() {
  const [events, setEvents] = useState<CollaborationEvent[]>([])

  useEffect(() => {
    fetchDashboardData().then((d) => setEvents(d.collaboration))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Team & Culture" subtitle="Adoption, engagement and collaboration signals" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {CULTURE.map((c, i) => (
          <MotionCard key={c.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{c.label}</p>
            <p className="kpi-value mt-3">{c.value}%</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${c.value}%` }} />
            </div>
          </MotionCard>
        ))}
      </section>

      <MotionCard delay={0.15} fillChild>
        <CollaborationPanel events={events.length ? events : undefined} />
      </MotionCard>
    </div>
  )
}
