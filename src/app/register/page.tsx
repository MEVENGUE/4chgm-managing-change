'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import OAuthButtons from '@/components/auth/OAuthButtons'
import PasswordStrength from '@/components/auth/PasswordStrength'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/i18n/I18nProvider'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register, loginWithOAuth } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', company: '', role: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError(t('auth.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        company: form.company,
        role: form.role,
        email: form.email,
        password: form.password,
      })
    } catch {
      setError(t('auth.passwordMismatch'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label={t('auth.firstName')} value={form.firstName} onChange={(v) => set('firstName', v)} />
          <AuthInput label={t('auth.lastName')} value={form.lastName} onChange={(v) => set('lastName', v)} />
        </div>
        <AuthInput label={t('auth.username')} value={form.username} onChange={(v) => set('username', v)} />
        <AuthInput label={t('auth.company')} value={form.company} onChange={(v) => set('company', v)} />
        <AuthInput label={t('auth.role')} value={form.role} onChange={(v) => set('role', v)} />
        <AuthInput label={t('auth.email')} type="email" value={form.email} onChange={(v) => set('email', v)} />
        <AuthInput label={t('auth.password')} type="password" value={form.password} onChange={(v) => set('password', v)} />
        <PasswordStrength password={form.password} />
        <AuthInput label={t('auth.confirmPassword')} type="password" value={form.confirm} onChange={(v) => set('confirm', v)} error={error} />
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('auth.signUp')}
        </button>
        <p className="text-center text-xs text-[var(--text-muted)]">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">{t('auth.signIn')}</Link>
        </p>
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]" /></div>
          <p className="relative mx-auto w-fit bg-[var(--bg-surface)] px-3 text-[10px] text-[var(--text-muted)]">{t('auth.orContinue')}</p>
        </div>
        <OAuthButtons disabled={loading} onOAuth={(provider) => loginWithOAuth(provider, { afterRegister: true })} />
      </form>
    </AuthLayout>
  )
}
