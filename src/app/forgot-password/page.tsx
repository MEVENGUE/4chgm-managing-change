'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/i18n/I18nProvider'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await forgotPassword(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle className="h-10 w-10 text-[var(--success)]" />
          <p className="text-sm text-[var(--text-secondary)]">{t('auth.resetSent')}</p>
          <Link href="/login" className="text-sm font-semibold text-[var(--primary)] hover:underline">{t('auth.signIn')}</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput label={t('auth.email')} type="email" value={email} onChange={setEmail} />
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('auth.sendReset')}
          </button>
          <Link href="/login" className="block text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">{t('common.back')}</Link>
        </form>
      )}
    </AuthLayout>
  )
}
