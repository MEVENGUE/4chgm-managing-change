'use client'

import { useEffect, useRef, useState } from 'react'

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const raf = useRef<number>()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
      setActive(true)
    }
    const onLeave = () => setActive(false)

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.08
      pos.current.y += (target.current.y - pos.current.y) * 0.08
      if (ref.current) {
        ref.current.style.left = `${pos.current.x}px`
        ref.current.style.top = `${pos.current.y}px`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return <div ref={ref} className={`cinematic-cursor-glow ${active ? 'active' : ''}`} aria-hidden="true" />
}
