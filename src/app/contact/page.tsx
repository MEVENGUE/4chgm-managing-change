'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, Send, Mail } from 'lucide-react'
import MarketingShell from '@/components/layout/MarketingShell'
import AuthInput from '@/components/auth/AuthInput'

const INQUIRY_TYPES = ['Enterprise Demo', 'Support', 'Partnership', 'Recruitment', 'Technical Question'] as const

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inquiryType, setInquiryType] = useState<string>(INQUIRY_TYPES[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, inquiryType, message }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error ?? 'Failed')
      setSuccess(true)
    } catch {
      setError('Unable to send message. Please try again or email directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MarketingShell>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
            <Mail className="h-6 w-6 text-white" />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Contact 4CHGM</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
            Enterprise demos, partnerships, recruitment, or technical questions — we respond within 48 hours.
          </p>
          <div className="mt-8 space-y-3 text-xs text-[var(--text-secondary)]">
            <p>📧 mevengueengofranck@gmail.com</p>
            <p>Available for alternance, stage, and technical collaborations.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel-strong glass-elevated rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-[var(--success)]" />
                <p className="mt-4 text-lg font-semibold">Message sent</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Thank you — we&apos;ll be in touch shortly.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                <AuthInput label="Name" value={name} onChange={setName} />
                <AuthInput label="Email" type="email" value={email} onChange={setEmail} />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Inquiry type</label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                  >
                    {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                    placeholder="Tell us about your transformation goals..."
                  />
                </div>
                {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send message
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MarketingShell>
  )
}
