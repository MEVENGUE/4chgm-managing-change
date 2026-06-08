'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PremiumTooltip from './PremiumTooltip'
import { useChartColors } from './useChartColors'

export type AreaPoint = { label: string; value: number }

type Props = {
  data: AreaPoint[]
  color?: string
  height?: number
  showAxis?: boolean
  showGrid?: boolean
  valuePrefix?: string
  valueSuffix?: string
}

export default function AreaChartPremium({
  data,
  color,
  height = 120,
  showAxis = false,
  showGrid = false,
  valuePrefix = '',
  valueSuffix = '',
}: Props) {
  const colors = useChartColors()
  const stroke = color ?? colors.secondary
  const gradientId = useId().replace(/:/g, '')

  return (
    <div className="premium-chart w-full" style={{ height, ['--chart-glow' as string]: stroke }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="60%" stopColor={stroke} stopOpacity={0.08} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          )}

          {showAxis && (
            <>
              <XAxis
                dataKey="label"
                tick={{ fill: colors.text, fontSize: 10 }}
                axisLine={{ stroke: colors.axis }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: colors.text, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
            </>
          )}

          <Tooltip
            cursor={{ stroke: colors.axis, strokeWidth: 1 }}
            content={<PremiumTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: stroke,
              stroke: 'var(--bg-base)',
              strokeWidth: 2,
            }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
