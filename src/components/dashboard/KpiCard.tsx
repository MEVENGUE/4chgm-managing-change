'use client'

import MotionCard from '@/components/motion/MotionCard'
import Sparkline from '@/components/charts/Sparkline'
import { useChartColors } from '@/components/charts/useChartColors'

type Props = {
  title: string
  value: string | number
  change?: string
  suffix?: string
  delay?: number
  trend?: number[]
  trendTone?: 'primary' | 'secondary' | 'success' | 'warning'
}

export default function KpiCard({ title, value, change, suffix, delay = 0, trend, trendTone = 'secondary' }: Props) {
  const colors = useChartColors()
  const toneColor = colors[trendTone]

  return (
    <MotionCard delay={delay} fill className="glass-panel-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kpi-label truncate">{title}</p>
          <p className="kpi-value mt-3">
            {value}
            {suffix ? <span className="ml-1 text-base font-medium text-[var(--text-muted)]">{suffix}</span> : null}
          </p>
        </div>
        {trend && trend.length > 1 && (
          <div className="w-20 shrink-0" style={{ marginTop: 2 }}>
            <Sparkline data={trend} color={toneColor} height={40} />
          </div>
        )}
      </div>
      {change ? <p className="kpi-change mt-2">{change}</p> : null}
    </MotionCard>
  )
}
