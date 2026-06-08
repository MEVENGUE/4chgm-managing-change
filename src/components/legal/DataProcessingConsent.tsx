'use client'

import { useState } from 'react'
import { Shield, Check } from 'lucide-react'
import { DATA_POLICY_SUMMARY, acceptDataConsent, hasDataConsent } from '@/lib/dataPolicy'

type Props = {
  onAccepted?: () => void
  compact?: boolean
}

export default function DataProcessingConsent({ onAccepted, compact = false }: Props) {
  const [accepted, setAccepted] = useState(hasDataConsent())

  function handleAccept() {
    acceptDataConsent()
    setAccepted(true)
    onAccepted?.()
  }

  if (accepted) {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success-muted)] px-3 py-2 text-[10px] text-[var(--success)] ${compact ? '' : 'mt-2'}`}>
        <Check className="h-3.5 w-3.5" /> Consentement IA enregistré — vos données sont traitées selon la politique 4CHGM.
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-surface)] p-4 ${compact ? '' : 'mt-2'}`}>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-[var(--primary)]" />
        <p className="text-xs font-semibold text-[var(--text-primary)]">{DATA_POLICY_SUMMARY.title}</p>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Pour analyser vos documents via OpenAI (Railway), 4CHGM traite le contenu que vous fournissez afin de personnaliser les réponses IA.
        Stockage local des documents ingérés · transit chiffré vers le backend · pas de revente de données.
      </p>
      <ul className="mt-2 space-y-1 text-[10px] text-[var(--text-secondary)]">
        {DATA_POLICY_SUMMARY.purposes.slice(0, 2).map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
      <button
        onClick={handleAccept}
        className="mt-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90"
      >
        J&apos;accepte le traitement IA de mes données
      </button>
    </div>
  )
}
