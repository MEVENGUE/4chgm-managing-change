'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildDashboardFromPortfolio } from '@/lib/portfolioDashboard'
import { useIntelligence } from '@/providers/IntelligenceProvider'
import { useProjects } from '@/providers/ProjectsProvider'
import { getAllSources, KNOWLEDGE_UPDATED_EVENT, type KnowledgeSource } from '@/services/knowledge'

export function usePortfolioDashboard() {
  const { initiatives, ready: projectsReady } = useProjects()
  const intel = useIntelligence()
  const [knowledge, setKnowledge] = useState<KnowledgeSource[]>([])

  useEffect(() => {
    const refresh = () => setKnowledge(getAllSources())
    refresh()
    window.addEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
  }, [])

  const data = useMemo(
    () => buildDashboardFromPortfolio(initiatives, knowledge),
    [initiatives, knowledge]
  )

  return { data, initiatives, intel, knowledge, ready: projectsReady }
}
