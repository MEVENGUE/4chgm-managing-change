'use client'

import { motion } from 'framer-motion'

type Props = {
  title: string
  subtitle: string
  children: React.ReactNode
  delay?: number
}

export default function PremiumAuthCard({ title, subtitle, children, delay = 0.2 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="premium-auth-card relative w-full max-w-md overflow-hidden p-8"
    >
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1 }}
          className="text-xl font-bold tracking-tight text-[var(--text-primary)]"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.15 }}
          className="mt-1 text-sm text-[var(--text-muted)]"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.22 }}
          className="mt-6"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  )
}
