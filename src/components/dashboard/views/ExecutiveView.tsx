'use client'

import dynamic from 'next/dynamic'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import KpiCard from '@/components/dashboard/KpiCard'
import AiAssistant from '@/components/dashboard/AiAssistant'
import SystemStatus from '@/components/dashboard/SystemStatus'
import RoadmapTimeline from '@/components/dashboard/RoadmapTimeline'
import InitiativesPanel from '@/components/dashboard/InitiativesPanel'
import CollaborationPanel from '@/components/dashboard/CollaborationPanel'
import InsightFeed from '@/components/dashboard/InsightFeed'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import SortableWidget from '@/components/dashboard/SortableWidget'
import DashboardGrid from '@/components/layout/DashboardGrid'
import MotionCard from '@/components/motion/MotionCard'
import { useDashboardLayout } from '@/providers/DashboardLayoutProvider'
import { useIntelligence } from '@/providers/IntelligenceProvider'
import type { WidgetId } from '@/lib/dashboardWidgets'
import type { DashboardData } from '@/types/dashboard'

const AIGlobe = dynamic(() => import('@/components/three/AIGlobe'), { ssr: false, loading: () => <GlobeFallback /> })

const WIDGET_SPAN: Record<WidgetId, string> = {
  kpis: 'col-span-full',
  globe: 'lg:col-span-8',
  'ai-assistant': 'lg:col-span-4',
  'system-status': 'lg:col-span-4',
  insights: 'lg:col-span-8',
  initiatives: 'lg:col-span-4',
  roadmap: 'lg:col-span-6',
  collaboration: 'lg:col-span-6',
}

function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative animate-pulse-soft" style={{ height: 128, width: 128 }}>
        <div className="absolute inset-0 rounded-full bg-[var(--glow-primary)]" style={{ filter: 'blur(36px)' }} />
        <div className="relative h-full w-full rounded-full border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10" />
      </div>
    </div>
  )
}

function TransformationGlobe({ overview }: { overview: DashboardData['overview'] }) {
  return (
    <MotionCard delay={0.2} className="h-full">
      <div className="glass-panel-strong flex h-full flex-col rounded-3xl p-6 md:p-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-3 lg:items-center">
          <div className="space-y-4">
            {[
              { label: 'People Impacted', value: overview.peopleImpacted.toLocaleString() },
              { label: 'Projects on Track', value: `${overview.projectsOnTrack}/${overview.projectsTotal}` },
              { label: 'At Risk', value: overview.atRisk, danger: true },
              { label: 'Completed', value: overview.completed, success: true },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.danger ? 'text-[var(--danger)]' : stat.success ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="relative w-full" style={{ height: 'clamp(240px, 32vw, 300px)' }}>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 animate-pulse-soft"
              style={{ height: '70%', width: '70%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, var(--glow-primary), transparent 65%)', filter: 'blur(48px)', opacity: 0.55 }}
            />
            <div className="relative h-full w-full"><AIGlobe /></div>
          </div>
          <div className="flex items-center justify-center">
            <ImpactDistribution segments={overview.impactDistribution} total={overview.peopleImpacted.toLocaleString()} compact />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">Global Transformation Overview</p>
      </div>
    </MotionCard>
  )
}

export default function ExecutiveView({ data }: { data: DashboardData }) {
  const { visibleOrder, reorder } = useDashboardLayout()
  const intel = useIntelligence()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(active.id as WidgetId, over.id as WidgetId)
    }
  }

  const widgets: Record<WidgetId, React.ReactNode> = {
    kpis: (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {data.kpis.map((kpi, i) => (
          <KpiCard key={kpi.id} title={kpi.title} value={kpi.value} change={kpi.change} suffix={kpi.suffix} trend={kpi.trend} trendTone={kpi.trendTone} delay={i * 0.05} />
        ))}
      </div>
    ),
    globe: <TransformationGlobe overview={data.overview} />,
    'ai-assistant': (
      <MotionCard delay={0.3} className="h-full">
        <div className="relative h-full">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--secondary)]/15 opacity-20 blur-xl" />
          <div className="relative h-full"><AiAssistant /></div>
        </div>
      </MotionCard>
    ),
    'system-status': (
      <MotionCard delay={0.35} className="h-full">
        <SystemStatus healthScore={intel.forecast.avgHealth || data.healthScore} atRiskCount={intel.forecast.atRiskCount} />
      </MotionCard>
    ),
    insights: (
      <MotionCard delay={0.45} fillChild className="h-full">
        <InsightFeed title="AI Executive Insight Feed" />
      </MotionCard>
    ),
    initiatives: (
      <MotionCard delay={0.5} fillChild className="h-full">
        <InitiativesPanel initiatives={data.initiatives} />
      </MotionCard>
    ),
    roadmap: (
      <MotionCard delay={0.55} fillChild className="h-full">
        <RoadmapTimeline roadmap={intel.roadmap} />
      </MotionCard>
    ),
    collaboration: (
      <MotionCard delay={0.6} fillChild className="h-full">
        <CollaborationPanel events={data.collaboration} />
      </MotionCard>
    ),
  }

  return (
    <DashboardGrid>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleOrder} strategy={rectSortingStrategy}>
          <div className="col-span-full grid gap-5 md:gap-6 lg:grid-cols-12 lg:auto-rows-fr">
            {visibleOrder.map((id) => (
              <SortableWidget key={id} id={id} className={WIDGET_SPAN[id]}>
                {widgets[id]}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </DashboardGrid>
  )
}
