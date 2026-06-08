'use client'

import FloatingInsightCard, { type InsightCardData } from '@/components/cinematic/FloatingInsightCard'

const INSIGHTS: InsightCardData[] = [
  { id: '1', title: '+12% Transformation Velocity', detail: 'Portfolio momentum rising', tone: 'positive', left: '4%', top: '14%', delay: 0 },
  { id: '2', title: 'AI Insight Generated', detail: 'Executive brief ready', tone: 'neutral', left: '68%', top: '8%', delay: 0.15 },
  { id: '3', title: 'Cloud Migration Stable', detail: 'Phase 2 on track', tone: 'positive', left: '76%', top: '52%', delay: 0.3 },
  { id: '4', title: 'Sprint Health 87%', detail: 'Delivery confidence high', tone: 'positive', left: '6%', top: '58%', delay: 0.45 },
  { id: '5', title: 'Budget Drift Detected', detail: 'Cloud line item +4.2%', tone: 'warning', left: '38%', top: '78%', delay: 0.6 },
]

export default function FloatingInsightCards() {
  return (
    <>
      {INSIGHTS.map((card, i) => (
        <FloatingInsightCard key={card.id} data={card} index={i} />
      ))}
    </>
  )
}
