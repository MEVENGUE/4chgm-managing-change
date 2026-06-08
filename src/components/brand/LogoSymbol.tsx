'use client'

import { useTheme } from '@/providers/ThemeProvider'

type Props = { size?: number; className?: string }

/** Orbital intelligence mark — compact symbol for sidebar, favicon, loading */
export default function LogoSymbol({ size = 36, className = '' }: Props) {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const core = dark ? '#7c5cff' : '#5b4fd6'
  const node = dark ? '#a78bfa' : '#8b7fd4'
  const line = dark ? 'rgba(232,234,255,0.45)' : 'rgba(61,68,85,0.35)'
  const ring = dark ? 'rgba(124,92,255,0.25)' : 'rgba(91,79,214,0.18)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="17" stroke={ring} strokeWidth="1" />
      <circle cx="20" cy="20" r="11" stroke={ring} strokeWidth="0.75" strokeDasharray="3 4" opacity="0.6" />
      <circle cx="20" cy="20" r="4.5" fill={core} />
      <circle cx="20" cy="20" r="4.5" fill={core} opacity="0.4" filter="blur(4px)" />
      {[
        [20, 6],
        [32, 20],
        [20, 34],
        [8, 20],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1="20" y1="20" x2={x} y2={y} stroke={line} strokeWidth="1" />
          <circle cx={x} cy={y} r="2.5" fill={node} />
        </g>
      ))}
    </svg>
  )
}
