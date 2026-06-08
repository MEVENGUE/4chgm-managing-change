'use client'

import { motion } from 'framer-motion'
import MotionCard from '@/components/motion/MotionCard'

type GridSectionProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  sticky?: boolean
}

export function GridSection({ children, className = '', delay = 0, sticky = false }: GridSectionProps) {
  return (
    <MotionCard
      delay={delay}
      className={`${sticky ? 'lg:sticky lg:top-24' : ''} ${className}`}
    >
      {children}
    </MotionCard>
  )
}

type DashboardGridProps = {
  children: React.ReactNode
  className?: string
}

export default function DashboardGrid({ children, className = '' }: DashboardGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`dashboard-grid mx-auto w-full space-y-5 md:space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {children}
    </section>
  )
}

export function MainGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid gap-5 md:gap-6 lg:grid-cols-12 lg:items-start">
      {children}
    </section>
  )
}

export function WidgetRow({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const colClass = cols === 3 ? 'lg:grid-cols-3' : cols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-4'
  return (
    <section className={`grid gap-5 sm:auto-rows-fr sm:grid-cols-2 md:gap-6 ${colClass}`}>
      {children}
    </section>
  )
}

export function Panel({ children, className = '', span }: {
  children: React.ReactNode
  className?: string
  span?: 2 | 3 | 4 | 5 | 7 | 8
}) {
  const spanClass = span ? `lg:col-span-${span}` : ''
  return (
    <div className={`glass-panel-strong rounded-3xl p-6 ${spanClass} ${className}`}>
      {children}
    </div>
  )
}
