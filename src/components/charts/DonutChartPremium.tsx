'use client'

import { useId } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import PremiumTooltip from './PremiumTooltip'

export type DonutSegment = {
  label: string
  value: number
  color: string
}

type Props = {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  centerValue?: string
  centerLabel?: string
  valueSuffix?: string
}

export default function DonutChartPremium({
  segments,
  size = 150,
  thickness = 14,
  centerValue,
  centerLabel,
  valueSuffix = '%',
}: Props) {
  const baseId = useId().replace(/:/g, '')
  const outer = size / 2
  const inner = outer - thickness

  return (
    <div className="premium-chart relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {segments.map((s, i) => (
              <linearGradient key={i} id={`${baseId}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={1} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <Tooltip content={<PremiumTooltip valueSuffix={valueSuffix} />} />
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={inner}
            outerRadius={outer}
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            animationDuration={1100}
            animationEasing="ease-out"
          >
            {segments.map((s, i) => (
              <Cell key={i} fill={`url(#${baseId}-${i})`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
