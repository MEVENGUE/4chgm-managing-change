import { apiDelete, apiGet, apiPatch, apiPost, isApiEnabled } from '@/lib/apiClient'
import type { Initiative } from '@/types/projects'

type ApiProject = {
  id: string
  name: string
  description: string
  owner: string
  status: string
  phase: string
  progress: number
  budgetPlanned: number
  budgetSpent: number
  riskScore: number
  impactScore: number
  startDate: string
  dueDate: string
  dependencies: string[]
  tags: string[]
}

function toInitiative(p: ApiProject): Initiative {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    owner: p.owner,
    status: p.status as Initiative['status'],
    phase: p.phase,
    progress: p.progress,
    budgetPlanned: p.budgetPlanned,
    budgetSpent: p.budgetSpent,
    riskScore: p.riskScore,
    impactScore: p.impactScore,
    startDate: p.startDate,
    dueDate: p.dueDate,
    dependencies: p.dependencies,
    tags: p.tags,
  }
}

export async function fetchProjectsFromApi(): Promise<Initiative[] | null> {
  if (!isApiEnabled()) return null
  try {
    const rows = await apiGet<ApiProject[]>('/api/v1/projects')
    return rows.map(toInitiative)
  } catch {
    return null
  }
}

export async function createProjectOnApi(data: Partial<Initiative>): Promise<Initiative | null> {
  if (!isApiEnabled()) return null
  try {
    const res = await apiPost<ApiProject>('/api/v1/projects', {
      title: data.name,
      description: data.description,
      status: data.status,
      risk_score: data.riskScore,
      impact_score: data.impactScore,
      budget_planned: data.budgetPlanned,
      budget_spent: data.budgetSpent,
      progress: data.progress,
      owner: data.owner,
      phase: data.phase,
      start_date: data.startDate,
      due_date: data.dueDate,
      tags: data.tags,
      dependencies: data.dependencies,
    })
    return toInitiative(res)
  } catch {
    return null
  }
}

export async function updateProjectOnApi(id: string, data: Partial<Initiative>): Promise<Initiative | null> {
  if (!isApiEnabled()) return null
  try {
    const res = await apiPatch<ApiProject>(`/api/v1/projects/${id}`, {
      title: data.name,
      description: data.description,
      status: data.status,
      risk_score: data.riskScore,
      impact_score: data.impactScore,
      budget_planned: data.budgetPlanned,
      budget_spent: data.budgetSpent,
      progress: data.progress,
      owner: data.owner,
      phase: data.phase,
      start_date: data.startDate,
      due_date: data.dueDate,
      tags: data.tags,
      dependencies: data.dependencies,
    })
    return toInitiative(res)
  } catch {
    return null
  }
}

export async function deleteProjectOnApi(id: string): Promise<boolean> {
  if (!isApiEnabled()) return false
  try {
    await apiDelete(`/api/v1/projects/${id}`)
    return true
  } catch {
    return false
  }
}
