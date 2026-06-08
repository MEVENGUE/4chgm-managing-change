'use client'

type TooltipPayloadItem = {
  name?: string
  value?: number | string
  color?: string
  payload?: Record<string, unknown>
}

type Props = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  valuePrefix?: string
  valueSuffix?: string
  labelFormatter?: (label: string | number) => string
}

export default function PremiumTooltip({
  active,
  payload,
  label,
  valuePrefix = '',
  valueSuffix = '',
  labelFormatter,
}: Props) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="dropdown-panel px-3 py-2" style={{ minWidth: 120 }}>
      {label !== undefined && (
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="mt-1 space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
            />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {valuePrefix}
              {item.value}
              {valueSuffix}
            </span>
            {item.name && <span className="text-[10px] text-[var(--text-muted)]">{item.name}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
