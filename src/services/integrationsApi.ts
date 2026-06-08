import { apiDelete, apiGet, apiPost, isApiEnabled } from '@/lib/apiClient'
import { getAccessToken } from '@/services/auth/tokenService'

export type ApiIntegration = {
  id: string
  provider: string
  status: string
  records: number
  lastSync: string | null
}

export async function fetchIntegrationsFromApi(): Promise<ApiIntegration[] | null> {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    return await apiGet<ApiIntegration[]>('/api/v1/integrations')
  } catch {
    return null
  }
}

export async function connectIntegration(provider: string): Promise<{ ok: boolean } | null> {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    await apiPost(`/api/v1/integrations/${provider}/demo-connect`)
    return { ok: true }
  } catch {
    return null
  }
}

export async function syncIntegration(provider: string) {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    return await apiPost(`/api/v1/integrations/${provider}/sync`)
  } catch {
    return null
  }
}

export async function disconnectIntegration(provider: string) {
  if (!isApiEnabled() || !getAccessToken()) return false
  try {
    await apiDelete(`/api/v1/integrations/${provider}`)
    return true
  } catch {
    return false
  }
}
