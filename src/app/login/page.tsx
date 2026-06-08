'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/i18n/I18nProvider'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password, remember })
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label={t('auth.email')} type="email" value={email} onChange={setEmail} autoComplete="email" />
        <AuthInput label={t('auth.password')} type="password" value={password} onChange={setPassword} autoComplete="current-password" error={error} />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-[var(--text-secondary)]">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
            {t('auth.rememberMe')}
          </label>
          <Link href="/forgot-password" className="text-[var(--primary)] transition hover:underline">{t('auth.forgotPassword')}</Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('auth.signIn')}
        </button>
        <p className="text-center text-xs text-[var(--text-muted)]">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="font-semibold text-[var(--primary)] hover:underline">{t('auth.signUp')}</Link>
        </p>
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]" /></div>
          <p className="relative mx-auto w-fit bg-[var(--bg-surface)] px-3 text-[10px] text-[var(--text-muted)]">{t('auth.orContinue')}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['google', 'microsoft'].map((p) => (
            <button key={p} type="button" className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)]">
              {t(`auth.${p}`)}
            </button>
          ))}
        </div>
      </form>
    </AuthLayout>
  )
}
