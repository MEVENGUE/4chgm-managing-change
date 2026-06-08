'use client'

import dynamic from 'next/dynamic'
import { Workflow } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'

const MermaidStudio = dynamic(() => import('@/components/mermaid/MermaidStudio'), {
  ssr: false,
  loading: () => (
    <div className="glass-panel-strong h-96 animate-pulse-soft rounded-3xl" />
  ),
})

export default function MermaidPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Workflow}
        title="Mermaid Studio"
        subtitle="AI-native diagram editor with live rendering and export"
      />
      <MotionCard delay={0.05}>
        <MermaidStudio />
      </MotionCard>
    </div>
  )
}
