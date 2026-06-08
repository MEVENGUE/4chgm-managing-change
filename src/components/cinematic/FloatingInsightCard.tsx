'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Brain, Cloud, Activity, AlertTriangle } from 'lucide-react'

const ICONS = [TrendingUp, Brain, Cloud, Activity, AlertTriangle]

export type InsightCardData = {
  id: string
  title: string
  detail: string
  tone?: 'positive' | 'neutral' | 'warning'
  left: string
  top: string
  delay: number
}

type Props = { data: InsightCardData; index: number }

const TONE_COLOR = {
  positive: 'var(--success)',
  neutral: 'var(--primary)',
  warning: 'var(--warning)',
}

export default function FloatingInsightCard({ data, index }: Props) {
  const Icon = ICONS[index % ICONS.length]
  const color = TONE_COLOR[data.tone ?? 'neutral']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 + data.delay, ease: [0.22, 1, 0.36, 1] }}
      className="floating-insight-card"
      style={{ left: data.left, top: data.top }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5 + index * 0.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
          >
            <Icon className="h-3 w-3" style={{ color }} />
          </span>
          <Sparkles className="h-3 w-3 text-[var(--text-muted)]" />
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-snug text-[var(--text-primary)]">{data.title}</p>
        <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{data.detail}</p>
      </motion.div>
    </motion.div>
  )
}
