'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Initiative } from '@/types/projects'

const STORAGE_KEY = '4chgm-projects'

const SEED: Initiative[] = [
  {
    id: 'cloud-2',
    name: 'Cloud Migration — Phase 2',
    description: 'Migrate 14 workloads to AWS/Azure with reserved-instance optimization.',
    owner: 'Alex Johnson',
    status: 'on-track',
    phase: 'Migration',
    progress: 72,
    budgetPlanned: 1_800_000,
    budgetSpent: 1_240_000,
    riskScore: 38,
    impactScore: 88,
    startDate: '2026-02-01',
    dueDate: '2026-09-30',
    dependencies: [],
    tags: ['cloud', 'cost', 'infrastructure'],
  },
  {
    id: 'erp',
    name: 'ERP Modernization',
    description: 'Replace legacy ERP with cloud-native platform and data governance.',
    owner: 'Maria Santos',
    status: 'at-risk',
    phase: 'Build',
    progress: 45,
    budgetPlanned: 2_400_000,
    budgetSpent: 1_560_000,
    riskScore: 72,
    impactScore: 91,
    startDate: '2026-01-15',
    dueDate: '2026-12-15',
    dependencies: ['cloud-2'],
    tags: ['erp', 'governance', 'data'],
  },
  {
    id: 'ai-adopt',
    name: 'AI Adoption Program',
    description: 'Enterprise-wide AI enablement, copilots and governance framework.',
    owner: 'Dr. Sarah Chen',
    status: 'on-track',
    phase: 'Scale',
    progress: 88,
    budgetPlanned: 900_000,
    budgetSpent: 610_000,
    riskScore: 28,
    impactScore: 95,
    startDate: '2026-03-01',
    dueDate: '2026-08-31',
    dependencies: [],
    tags: ['ai', 'enablement'],
  },
  {
    id: 'data-gov',
    name: 'Data Governance Framework',
    description: 'Establish data quality, lineage and stewardship across departments.',
    owner: 'James Park',
    status: 'at-risk',
    phase: 'Foundation',
    progress: 34,
    budgetPlanned: 700_000,
    budgetSpent: 280_000,
    riskScore: 64,
    impactScore: 76,
    startDate: '2026-04-01',
    dueDate: '2026-11-30',
    dependencies: ['erp'],
    tags: ['data', 'governance'],
  },
  {
    id: 'devsec',
    name: 'DevSecOps Pipeline',
    description: 'Shift-left security, automated scanning and compliance gates.',
    owner: 'Priya Nair',
    status: 'planning',
    phase: 'Discovery',
    progress: 12,
    budgetPlanned: 500_000,
    budgetSpent: 40_000,
    riskScore: 44,
    impactScore: 70,
    startDate: '2026-06-01',
    dueDate: '2027-01-31',
    dependencies: ['cloud-2'],
    tags: ['devops', 'security'],
  },
]

type ProjectsContextValue = {
  ready: boolean
  initiatives: Initiative[]
  addInitiative: (data: Omit<Initiative, 'id'>) => void
  updateInitiative: (id: string, patch: Partial<Initiative>) => void
  removeInitiative: (id: string) => void
  getById: (id: string) => Initiative | undefined
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [initiatives, setInitiatives] = useState<Initiative[]>([])

  useEffect(() => {
    let loaded: Initiative[] = SEED
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('nexora-projects')
      if (raw) loaded = JSON.parse(raw) as Initiative[]
    } catch {
      /* ignore */
    }
    setInitiatives(loaded)
    setReady(true)
  }, [])

  const persist = useCallback((next: Initiative[]) => {
    setInitiatives(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const addInitiative = useCallback(
    (data: Omit<Initiative, 'id'>) => {
      const item: Initiative = { ...data, id: `i-${Date.now()}` }
      persist([item, ...initiatives])
    },
    [initiatives, persist]
  )

  const updateInitiative = useCallback(
    (id: string, patch: Partial<Initiative>) => {
      persist(initiatives.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    },
    [initiatives, persist]
  )

  const removeInitiative = useCallback(
    (id: string) => {
      persist(initiatives.filter((i) => i.id !== id).map((i) => ({ ...i, dependencies: i.dependencies.filter((d) => d !== id) })))
    },
    [initiatives, persist]
  )

  const getById = useCallback((id: string) => initiatives.find((i) => i.id === id), [initiatives])

  const value = useMemo(
    () => ({ ready, initiatives, addInitiative, updateInitiative, removeInitiative, getById }),
    [ready, initiatives, addInitiative, updateInitiative, removeInitiative, getById]
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}
