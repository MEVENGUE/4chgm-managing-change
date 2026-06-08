'use client'

import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { useChartColors } from './useChartColors'

type Props = {
  data: number[]
  color?: string
  height?: number
}

export default function Sparkline({ data, color, height = 36 }: Props) {
  const colors = useChartColors()
  const stroke = color ?? colors.secondary
  const gradientId = useId().replace(/:/g, '')
  const chartData = data.map((value, i) => ({ i, value }))

  return (
    <div className="premium-chart w-full" style={{ height, ['--chart-glow' as string]: stroke }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
