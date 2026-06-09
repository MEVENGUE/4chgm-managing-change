'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/i18n/I18nProvider'
import type { OAuthProvider } from '@/services/auth/types'

type Props = {
  onOAuth: (provider: OAuthProvider) => Promise<void>
  disabled?: boolean
}

const PROVIDER_STYLES: Record<OAuthProvider, string> = {
  google: 'hover:border-[#4285f4]/40',
  microsoft: 'hover:border-[#0078d4]/40',
}

export default function OAuthButtons({ onOAuth, disabled }: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState<OAuthProvider | null>(null)

  async function handleClick(provider: OAuthProvider) {
    if (disabled || loading) return
    setLoading(provider)
    try {
      await onOAuth(provider)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {(['google', 'microsoft'] as const).map((provider) => (
        <button
          key={provider}
          type="button"
          disabled={disabled || !!loading}
          onClick={() => handleClick(provider)}
          className={`flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] disabled:opacity-50 ${PROVIDER_STYLES[provider]}`}
        >
          {loading === provider ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <span className="text-sm font-bold opacity-80">{provider === 'google' ? 'G' : 'M'}</span>
          )}
          {t(`auth.${provider}`)}
        </button>
      ))}
    </div>
  )
}
