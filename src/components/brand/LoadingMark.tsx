'use client'

import { motion } from 'framer-motion'
import LogoSymbol from './LogoSymbol'

type Props = { label?: string; className?: string }

/** Animated brand loader for auth and route transitions */
export default function LoadingMark({ label = '4CHGM', className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-xl"
          style={{ background: 'radial-gradient(circle, var(--glow-primary), transparent 70%)' }}
        />
        <LogoSymbol size={48} />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xs font-semibold tracking-[0.2em] text-[var(--text-muted)]"
      >
        {label}
      </motion.p>
    </div>
  )
}
