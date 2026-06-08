'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import PasswordStrength from '@/components/auth/PasswordStrength'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/i18n/I18nProvider'

function ResetForm() {
  const { t } = useTranslation()
  const { doResetPassword } = useAuth()
  const params = useSearchParams()
  const token = params.get('token') ?? 'demo-token'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      await doResetPassword(token, password)
      setDone(true)
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{t('auth.resetPassword')}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-[var(--primary)] hover:underline">{t('auth.signIn')}</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput label={t('auth.password')} type="password" value={password} onChange={setPassword} />
      <PasswordStrength password={password} />
      <AuthInput label={t('auth.confirmPassword')} type="password" value={confirm} onChange={setConfirm} error={error} />
      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t('auth.resetPassword')}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">{t('common.loading')}</p>}>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  )
}
