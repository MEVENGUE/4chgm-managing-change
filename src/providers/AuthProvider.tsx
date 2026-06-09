'use client'

import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getSession,
  login as authLogin,
  loginWithOAuth as authLoginWithOAuth,
  register as authRegister,
  logout as authLogout,
  requestPasswordReset,
  resetPassword,
  type AuthSession,
  type LoginCredentials,
  type OAuthProvider,
  type RegisterPayload,
  type UserProfile,
} from '@/services/auth'

type AuthContextValue = {
  ready: boolean
  session: AuthSession | null
  user: UserProfile | null
  login: (c: LoginCredentials) => Promise<void>
  loginWithOAuth: (provider: OAuthProvider, opts?: { afterRegister?: boolean }) => Promise<void>
  register: (p: RegisterPayload) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  doResetPassword: (token: string, password: string) => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<AuthSession | null>(null)

  const refresh = useCallback(() => setSession(getSession()), [])

  useEffect(() => {
    refresh()
    setReady(true)
  }, [refresh])

  const postAuthRedirect = useCallback(
    (fallback: string) => {
      const redirect = searchParams.get('redirect')
      router.push(redirect && redirect.startsWith('/') ? redirect : fallback)
    },
    [router, searchParams]
  )

  const login = useCallback(async (c: LoginCredentials) => {
    const s = await authLogin(c)
    setSession(s)
    postAuthRedirect('/dashboard')
  }, [postAuthRedirect])

  const loginWithOAuth = useCallback(
    async (provider: OAuthProvider, opts?: { afterRegister?: boolean }) => {
      const s = await authLoginWithOAuth(provider)
      setSession(s)
      postAuthRedirect(opts?.afterRegister ? '/onboarding' : '/dashboard')
    },
    [postAuthRedirect]
  )

  const register = useCallback(async (p: RegisterPayload) => {
    const s = await authRegister(p)
    setSession(s)
    postAuthRedirect('/onboarding')
  }, [postAuthRedirect])

  const logout = useCallback(() => {
    authLogout()
    setSession(null)
    router.push('/login')
  }, [router])

  const forgotPassword = useCallback(async (email: string) => {
    await requestPasswordReset(email)
  }, [])

  const doResetPassword = useCallback(async (token: string, password: string) => {
    await resetPassword(token, password)
  }, [])

  const value = useMemo(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      login,
      loginWithOAuth,
      register,
      logout,
      forgotPassword,
      doResetPassword,
      refresh,
    }),
    [ready, session, login, loginWithOAuth, register, logout, forgotPassword, doResetPassword, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </Suspense>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
