'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSession,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  requestPasswordReset,
  resetPassword,
  type AuthSession,
  type LoginCredentials,
  type RegisterPayload,
  type UserProfile,
} from '@/services/auth'

type AuthContextValue = {
  ready: boolean
  session: AuthSession | null
  user: UserProfile | null
  login: (c: LoginCredentials) => Promise<void>
  register: (p: RegisterPayload) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  doResetPassword: (token: string, password: string) => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<AuthSession | null>(null)

  const refresh = useCallback(() => setSession(getSession()), [])

  useEffect(() => {
    refresh()
    setReady(true)
  }, [refresh])

  const login = useCallback(async (c: LoginCredentials) => {
    const s = await authLogin(c)
    setSession(s)
    router.push('/dashboard')
  }, [router])

  const register = useCallback(async (p: RegisterPayload) => {
    const s = await authRegister(p)
    setSession(s)
    router.push('/onboarding')
  }, [router])

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
      register,
      logout,
      forgotPassword,
      doResetPassword,
      refresh,
    }),
    [ready, session, login, register, logout, forgotPassword, doResetPassword, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
