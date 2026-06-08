'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
  icon?: LucideIcon
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, icon: Icon, actions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  )
}
