import { apiPost, isApiEnabled } from '@/lib/apiClient'
import type { AuthSession, LoginCredentials, RegisterPayload } from '@/services/auth/types'

type ApiAuthResponse = {
  token: string
  refreshToken: string
  user: AuthSession['user']
  expiresAt: string
  workspaceId?: string
  organizationId?: string
}

function toSession(res: ApiAuthResponse): AuthSession {
  return {
    token: res.token,
    refreshToken: res.refreshToken,
    user: res.user,
    expiresAt: res.expiresAt,
    workspaceId: res.workspaceId,
    organizationId: res.organizationId,
  }
}

export async function loginWithApi(credentials: LoginCredentials): Promise<AuthSession | null> {
  if (!isApiEnabled()) return null
  try {
    const res = await apiPost<ApiAuthResponse>('/api/v1/auth/login', credentials)
    return toSession(res)
  } catch {
    return null
  }
}

export async function registerWithApi(payload: RegisterPayload): Promise<AuthSession | null> {
  if (!isApiEnabled()) return null
  try {
    const res = await apiPost<ApiAuthResponse>('/api/v1/auth/register', payload)
    return toSession(res)
  } catch {
    return null
  }
}

export async function refreshWithApi(refreshToken: string): Promise<AuthSession | null> {
  if (!isApiEnabled()) return null
  try {
    const res = await apiPost<ApiAuthResponse>('/api/v1/auth/refresh', { refreshToken })
    return toSession(res)
  } catch {
    return null
  }
}
