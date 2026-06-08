'use client'

import { useTranslation } from '@/i18n/I18nProvider'

export function scorePassword(pw: string): number {
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(4, s)
}

export default function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslation()
  const score = scorePassword(password)
  const labels = [t('auth.weak'), t('auth.fair'), t('auth.fair'), t('auth.strong'), t('auth.strong')]
  const colors = ['var(--danger)', 'var(--warning)', 'var(--warning)', 'var(--success)', 'var(--success)']

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[var(--text-muted)]">{t('auth.passwordStrength')}</span>
        <span style={{ color: colors[score] }}>{labels[score]}</span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? colors[score] : 'var(--bg-surface-strong)' }}
          />
        ))}
      </div>
    </div>
  )
}
