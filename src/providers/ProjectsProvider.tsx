'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isApiEnabled } from '@/lib/apiClient'
import { useAuth } from '@/providers/AuthProvider'
import { getAccessToken } from '@/services/auth/tokenService'
import {
  createProjectOnApi,
  deleteProjectOnApi,
  fetchProjectsFromApi,
  updateProjectOnApi,
} from '@/services/projectsApi'
import type { Initiative } from '@/types/projects'

const STORAGE_PREFIX = '4chgm-projects'

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

function storageKey(userId?: string) {
  return userId ? `${STORAGE_PREFIX}-${userId}` : STORAGE_PREFIX
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [ready, setReady] = useState(false)
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [apiPrimary, setApiPrimary] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setReady(false)
      if (isApiEnabled() && getAccessToken()) {
        const apiProjects = await fetchProjectsFromApi()
        if (!cancelled && apiProjects !== null) {
          setInitiatives(apiProjects)
          setApiPrimary(true)
          setReady(true)
          return
        }
      }
      setApiPrimary(false)
      const key = storageKey(user?.id)
      let loaded: Initiative[] = SEED
      try {
        const raw = localStorage.getItem(key) ?? localStorage.getItem(STORAGE_PREFIX) ?? localStorage.getItem('nexora-projects')
        if (raw) loaded = JSON.parse(raw) as Initiative[]
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        setInitiatives(loaded)
        setReady(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const persist = useCallback(
    (next: Initiative[]) => {
      setInitiatives(next)
      if (apiPrimary) return
      try {
        localStorage.setItem(storageKey(user?.id), JSON.stringify(next))
      } catch {
        /* ignore */
      }
    },
    [apiPrimary, user?.id]
  )

  const addInitiative = useCallback(
    async (data: Omit<Initiative, 'id'>) => {
      if (isApiEnabled() && getAccessToken()) {
        const created = await createProjectOnApi(data)
        if (created) {
          setInitiatives((prev) => [created, ...prev])
          return
        }
      }
      const item: Initiative = { ...data, id: `i-${Date.now()}` }
      setInitiatives((prev) => {
        const next = [item, ...prev]
        if (!apiPrimary) {
          try {
            localStorage.setItem(storageKey(user?.id), JSON.stringify(next))
          } catch {
            /* ignore */
          }
        }
        return next
      })
    },
    [apiPrimary, user?.id]
  )

  const updateInitiative = useCallback(
    async (id: string, patch: Partial<Initiative>) => {
      if (isApiEnabled() && getAccessToken()) {
        const updated = await updateProjectOnApi(id, patch)
        if (updated) {
          setInitiatives((prev) => prev.map((i) => (i.id === id ? updated : i)))
          return
        }
      }
      setInitiatives((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
        if (!apiPrimary) {
          try {
            localStorage.setItem(storageKey(user?.id), JSON.stringify(next))
          } catch {
            /* ignore */
          }
        }
        return next
      })
    },
    [apiPrimary, user?.id]
  )

  const removeInitiative = useCallback(
    async (id: string) => {
      if (isApiEnabled() && getAccessToken()) {
        const ok = await deleteProjectOnApi(id)
        if (ok) {
          setInitiatives((prev) =>
            prev
              .filter((i) => i.id !== id)
              .map((i) => ({ ...i, dependencies: i.dependencies.filter((d) => d !== id) }))
          )
          return
        }
      }
      setInitiatives((prev) => {
        const next = prev
          .filter((i) => i.id !== id)
          .map((i) => ({ ...i, dependencies: i.dependencies.filter((d) => d !== id) }))
        if (!apiPrimary) {
          try {
            localStorage.setItem(storageKey(user?.id), JSON.stringify(next))
          } catch {
            /* ignore */
          }
        }
        return next
      })
    },
    [apiPrimary, user?.id]
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
