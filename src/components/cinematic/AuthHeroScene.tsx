'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import LogoFull from '@/components/brand/LogoFull'
import FloatingInsightCards from '@/components/cinematic/FloatingInsightCards'
import ParallaxDepth from '@/components/cinematic/ParallaxDepth'
import { useTranslation } from '@/i18n/I18nProvider'

const NeuralGlobe = dynamic(() => import('@/components/3d/NeuralGlobe'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-32 w-32 animate-pulse-soft rounded-full border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10" />
    </div>
  ),
})

export default function AuthHeroScene() {
  const { t } = useTranslation()

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden p-12">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <LogoFull />
      </motion.div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 mb-8 max-w-md text-center lg:text-left"
        >
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gradient">{t('auth.heroTitle')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{t('auth.heroSubtitle')}</p>
        </motion.div>

        <ParallaxDepth className="relative h-[min(52vh,420px)] w-full max-w-xl" depth={10}>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
            style={{ width: '70%', height: '70%', background: 'radial-gradient(circle, var(--glow-primary), transparent 65%)' }}
          />
          <div className="relative h-full w-full">
            <NeuralGlobe />
          </div>
          <FloatingInsightCards />
        </ParallaxDepth>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-[10px] text-[var(--text-muted)]"
      >
        © {new Date().getFullYear()} 4CHGM · {t('brand.tagline')}
      </motion.p>
    </div>
  )
}
