'use client'

import { useTheme } from '@/providers/ThemeProvider'
import LogoSymbol from './LogoSymbol'

type Props = { compact?: boolean; className?: string }

/** Horizontal wordmark — sidebar, auth, loading screens */
export default function LogoFull({ compact = false, className = '' }: Props) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const title = dark ? '#f5f7ff' : '#1c2230'
  const tag = dark ? '#a78bfa' : '#8b7fd4'
  const sub = dark ? '#7d86b2' : '#8a92a4'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex shrink-0 items-center justify-center rounded-xl border"
        style={{
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(46,38,74,0.1)',
          background: dark
            ? 'linear-gradient(135deg, rgba(91,79,214,0.2), rgba(124,92,255,0.12))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(247,244,239,0.95))',
        }}
      >
        <LogoSymbol size={compact ? 24 : 28} />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-[0.18em] leading-none" style={{ color: title }}>
            4CHGM
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: tag }}>
            Managing Change
          </p>
          <p className="mt-0.5 hidden text-[9px] tracking-wide lg:block" style={{ color: sub }}>
            AI-Powered Change Management
          </p>
        </div>
      )}
    </div>
  )
}
