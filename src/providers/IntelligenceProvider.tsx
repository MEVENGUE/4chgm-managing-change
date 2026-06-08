'use client'

import { createContext, useContext, useMemo } from 'react'
import { useProjects } from '@/providers/ProjectsProvider'
import { derivePlatformState, type PlatformIntelligence } from '@/lib/intelligence'

const IntelligenceContext = createContext<PlatformIntelligence | null>(null)

export function IntelligenceProvider({ children }: { children: React.ReactNode }) {
  const { initiatives } = useProjects()
  const state = useMemo(() => derivePlatformState(initiatives), [initiatives])
  return <IntelligenceContext.Provider value={state}>{children}</IntelligenceContext.Provider>
}

export function useIntelligence() {
  const ctx = useContext(IntelligenceContext)
  if (!ctx) throw new Error('useIntelligence must be used within IntelligenceProvider')
  return ctx
}
