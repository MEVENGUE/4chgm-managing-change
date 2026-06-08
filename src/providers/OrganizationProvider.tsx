'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { WORKSPACES, type Workspace } from '@/lib/workspaces'

export type { Workspace, WorkspaceView } from '@/lib/workspaces'

export type Organization = {
  name: string
  industry: string
  size: string
  departments: string[]
  tools: string[]
  cloud: string[]
  methodology: string
  goals: string[]
  maturityScore: number
  onboarded: boolean
}

const DEFAULT_WORKSPACES: Workspace[] = WORKSPACES

const EMPTY_ORG: Organization = {
  name: '',
  industry: '',
  size: '',
  departments: [],
  tools: [],
  cloud: [],
  methodology: '',
  goals: [],
  maturityScore: 0,
  onboarded: false,
}

type OrganizationContextValue = {
  ready: boolean
  organization: Organization
  workspaces: Workspace[]
  activeWorkspace: Workspace
  setActiveWorkspace: (id: string) => void
  completeOnboarding: (org: Omit<Organization, 'onboarded'>) => void
  resetOnboarding: () => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [organization, setOrganization] = useState<Organization>(EMPTY_ORG)
  const [activeId, setActiveId] = useState<string>(DEFAULT_WORKSPACES[0].id)

  useEffect(() => {
    try {
      const storedOrg = localStorage.getItem('4chgm-org') ?? localStorage.getItem('nexora-org')
      if (storedOrg) setOrganization({ ...EMPTY_ORG, ...JSON.parse(storedOrg) })
      const storedWs = localStorage.getItem('4chgm-workspace') ?? localStorage.getItem('nexora-workspace')
      if (storedWs) setActiveId(storedWs)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const completeOnboarding = useCallback((org: Omit<Organization, 'onboarded'>) => {
    const next: Organization = { ...org, onboarded: true }
    setOrganization(next)
    try {
      localStorage.setItem('4chgm-org', JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const resetOnboarding = useCallback(() => {
    setOrganization(EMPTY_ORG)
    try {
      localStorage.removeItem('4chgm-org')
    } catch {
      /* ignore */
    }
  }, [])

  const setActiveWorkspace = useCallback((id: string) => {
    setActiveId(id)
    try {
      localStorage.setItem('4chgm-workspace', id)
    } catch {
      /* ignore */
    }
  }, [])

  const activeWorkspace = useMemo(
    () => DEFAULT_WORKSPACES.find((w) => w.id === activeId) ?? DEFAULT_WORKSPACES[0],
    [activeId]
  )

  const value = useMemo(
    () => ({
      ready,
      organization,
      workspaces: DEFAULT_WORKSPACES,
      activeWorkspace,
      setActiveWorkspace,
      completeOnboarding,
      resetOnboarding,
    }),
    [ready, organization, activeWorkspace, setActiveWorkspace, completeOnboarding, resetOnboarding]
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider')
  return ctx
}
