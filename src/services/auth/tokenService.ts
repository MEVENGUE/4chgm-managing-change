import { BRAND } from '@/lib/brand'

const SESSION_COOKIE = `${BRAND.storagePrefix}-session`
const SESSION_STORAGE = `${BRAND.storagePrefix}-auth`

export function setSessionCookie(token: string, days = 7) {
  if (typeof document === 'undefined') return
  const maxAge = days * 86400
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function clearSessionCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`
}

export function persistSession(raw: string) {
  try {
    localStorage.setItem(SESSION_STORAGE, raw)
  } catch {
    /* ignore */
  }
}

export function loadSessionRaw(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE) ?? localStorage.getItem('nexora-auth')
  } catch {
    return null
  }
}

export function clearSessionStorage() {
  try {
    localStorage.removeItem(SESSION_STORAGE)
    localStorage.removeItem('nexora-auth')
  } catch {
    /* ignore */
  }
}

export function generateToken(): string {
  return `4chgm_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`
}

export function getAccessToken(): string | null {
  try {
    const raw = loadSessionRaw()
    if (!raw) return null
    const session = JSON.parse(raw) as { token?: string }
    return session.token ?? null
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  try {
    const raw = loadSessionRaw()
    if (!raw) return null
    const session = JSON.parse(raw) as { refreshToken?: string }
    return session.refreshToken ?? null
  } catch {
    return null
  }
}
