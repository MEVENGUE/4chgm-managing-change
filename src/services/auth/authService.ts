import { BRAND } from '@/lib/brand'
import { loginWithApi, registerWithApi } from '@/services/authApi'
import type { AuthSession, LoginCredentials, OAuthProvider, RegisterPayload, UserProfile } from './types'
import {
  clearSessionCookie,
  clearSessionStorage,
  generateToken,
  loadSessionRaw,
  persistSession,
  setSessionCookie,
} from './tokenService'

const RESET_KEY = `${BRAND.storagePrefix}-reset-tokens`

export const DEMO_USER: UserProfile = {
  id: 'u-demo',
  email: 'sarah.chen@4chgm.io',
  firstName: 'Sarah',
  lastName: 'Chen',
  username: 'schen',
  company: 'Acme Corp',
  role: 'Strategic Director',
  phone: '+1 415 555 0142',
  timezone: 'America/Los_Angeles',
  department: 'Transformation Office',
  bio: 'Leading enterprise transformation and AI adoption.',
  createdAt: new Date().toISOString(),
}

function sessionFromUser(user: UserProfile, remember = false): AuthSession {
  const token = generateToken()
  const days = remember ? 30 : 7
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString()
  return { token, user, expiresAt }
}

function saveSession(session: AuthSession, remember = false) {
  persistSession(JSON.stringify(session))
  setSessionCookie(session.token, remember ? 30 : 7)
}

export function getSession(): AuthSession | null {
  const raw = loadSessionRaw()
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as AuthSession
    if (new Date(s.expiresAt) < new Date()) {
      logout()
      return null
    }
    return s
  } catch {
    return null
  }
}

const OAUTH_PROFILES: Record<OAuthProvider, Pick<UserProfile, 'firstName' | 'lastName' | 'company' | 'role'>> = {
  google: { firstName: 'Alex', lastName: 'Rivera', company: 'Acme Corp', role: 'Product Lead' },
  microsoft: { firstName: 'Jordan', lastName: 'Kim', company: 'Acme Corp', role: 'Engineering Manager' },
}

/** Simulated OAuth sign-in for demo mode (works without backend credentials). */
export async function loginWithOAuth(provider: OAuthProvider, remember = true): Promise<AuthSession> {
  await delay(900)
  const profile = OAUTH_PROFILES[provider]
  const domain = provider === 'google' ? 'googleusercontent.com' : 'onmicrosoft.com'
  const email = `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@${domain}`
  const user: UserProfile = {
    id: `u-oauth-${provider}-${Date.now()}`,
    email,
    ...profile,
    username: `${profile.firstName.toLowerCase()}${profile.lastName[0]?.toLowerCase() ?? ''}`,
    authProvider: provider,
    createdAt: new Date().toISOString(),
  }
  const session = sessionFromUser(user, remember)
  saveSession(session, remember)
  return session
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const apiSession = await loginWithApi(credentials)
  if (apiSession) {
    saveSession(apiSession, credentials.remember)
    return apiSession
  }
  await delay(600)
  const email = credentials.email.trim().toLowerCase()
  if (!email || credentials.password.length < 4) throw new Error('invalid_credentials')
  const user: UserProfile = {
    ...DEMO_USER,
    email,
    firstName: email.split('@')[0].split('.')[0] || DEMO_USER.firstName,
    lastName: email.split('@')[0].split('.')[1] || DEMO_USER.lastName,
    authProvider: 'email',
  }
  const session = sessionFromUser(user, credentials.remember)
  saveSession(session, credentials.remember)
  return session
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  if (payload.password.length < 6) throw new Error('weak_password')
  const apiSession = await registerWithApi(payload)
  if (apiSession) {
    saveSession(apiSession, true)
    return apiSession
  }
  await delay(800)
  const user: UserProfile = {
    id: `u-${Date.now()}`,
    email: payload.email.trim().toLowerCase(),
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    company: payload.company,
    role: payload.role,
    authProvider: 'email',
    createdAt: new Date().toISOString(),
  }
  const session = sessionFromUser(user, true)
  saveSession(session, true)
  return session
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay(500)
  const token = generateToken()
  try {
    const raw = localStorage.getItem(RESET_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {}
    map[email.trim().toLowerCase()] = token
    localStorage.setItem(RESET_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await delay(600)
  if (password.length < 6) throw new Error('weak_password')
  try {
    const raw = localStorage.getItem(RESET_KEY)
    if (!raw) throw new Error('invalid_token')
    const map = JSON.parse(raw) as Record<string, string>
    if (!Object.values(map).includes(token)) throw new Error('invalid_token')
  } catch {
    throw new Error('invalid_token')
  }
}

export function logout() {
  clearSessionStorage()
  clearSessionCookie()
}

export function updateStoredUser(patch: Partial<UserProfile>) {
  const session = getSession()
  if (!session) return null
  const next = { ...session, user: { ...session.user, ...patch } }
  persistSession(JSON.stringify(next))
  return next.user
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
