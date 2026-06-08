'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

type Props = { children: ReactNode; className?: string; depth?: number }

export default function ParallaxDepth({ children, className = '', depth = 12 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const rotateX = useTransform(sy, [-0.5, 0.5], [depth * 0.15, -depth * 0.15])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-depth * 0.15, depth * 0.15])
  const translateX = useTransform(sx, [-0.5, 0.5], [-depth, depth])
  const translateY = useTransform(sy, [-0.5, 0.5], [-depth * 0.6, depth * 0.6])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const onMove = (e: PointerEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mx.set(x)
      my.set(y)
    }

    const el = ref.current
    el?.addEventListener('pointermove', onMove, { passive: true })
    return () => el?.removeEventListener('pointermove', onMove)
  }, [mx, my])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  )
}
