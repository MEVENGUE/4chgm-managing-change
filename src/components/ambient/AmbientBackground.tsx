'use client'

import GradientOrbs from '@/components/ambient/GradientOrbs'
import RadialLights from '@/components/ambient/RadialLights'
import AnimatedGrid from '@/components/ambient/AnimatedGrid'
import NoiseLayer from '@/components/ambient/NoiseLayer'
import CursorGlow from '@/components/ambient/CursorGlow'

type Props = {
  /** Enable cursor-following glow — best on auth/marketing, off on dashboard for perf */
  cursorGlow?: boolean
  /** Lighter variant for dense UIs */
  variant?: 'full' | 'subtle'
}

export default function AmbientBackground({ cursorGlow = false, variant = 'full' }: Props) {
  return (
    <div className="cinematic-ambient" aria-hidden="true">
      <GradientOrbs />
      {variant === 'full' && <RadialLights />}
      <AnimatedGrid />
      <div className="cinematic-volumetric" />
      <NoiseLayer />
      {cursorGlow && <CursorGlow />}
    </div>
  )
}
