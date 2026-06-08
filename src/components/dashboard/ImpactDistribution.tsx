'use client'

import DonutChartPremium from '@/components/charts/DonutChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import type { ImpactSegment } from '@/types/dashboard'

type Props = {
  segments?: ImpactSegment[]
  compact?: boolean
  total?: string
}

export default function ImpactDistribution({ segments, compact = false, total }: Props) {
  const colors = useChartColors()

  const fallback: ImpactSegment[] = [
    { label: 'High Impact', value: 32, color: colors.danger },
    { label: 'Medium Impact', value: 45, color: colors.warning },
    { label: 'Low Impact', value: 23, color: colors.success },
  ]

  const data = (segments ?? fallback).map((s) => ({
    label: s.label,
    value: s.value,
    color:
      s.color.startsWith('var(') || s.color.startsWith('#')
        ? resolveColor(s.color, colors)
        : s.color,
  }))

  const content = (
    <>
      {!compact && <p className="section-title">Impact Distribution</p>}
      <div className={`flex items-center justify-center ${compact ? '' : 'mt-4'}`}>
        <DonutChartPremium
          segments={data}
          size={compact ? 132 : 144}
          thickness={13}
          centerValue={total ?? '2,847'}
          centerLabel="Total"
        />
      </div>
      <div className={`space-y-2 ${compact ? 'mt-3' : 'mt-4'}`}>
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
              />
              <p className="text-xs text-[var(--text-secondary)]">{item.label}</p>
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)]">{item.value}%</p>
          </div>
        ))}
      </div>
    </>
  )

  if (compact) return <div className="w-full">{content}</div>

  return <div className="glass-panel-strong rounded-3xl p-6">{content}</div>
}

function resolveColor(value: string, colors: ReturnType<typeof useChartColors>): string {
  if (value.startsWith('#')) return value
  const map: Record<string, string> = {
    'var(--danger)': colors.danger,
    'var(--warning)': colors.warning,
    'var(--success)': colors.success,
    'var(--primary)': colors.primary,
    'var(--secondary)': colors.secondary,
    'var(--info)': colors.info,
  }
  return map[value] ?? colors.primary
}
