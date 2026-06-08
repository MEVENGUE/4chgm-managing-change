'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Loader2, X, Sparkles } from 'lucide-react'
import { useIntelligence } from '@/providers/IntelligenceProvider'
import { useOrganization } from '@/providers/OrganizationProvider'
import { generateExecutiveReport, downloadReport } from '@/lib/reports'

type Props = { open: boolean; onClose: () => void }

export default function ExecutiveReportModal({ open, onClose }: Props) {
  const intel = useIntelligence()
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)

  const orgName = organization.onboarded ? organization.name : '4CHGM Enterprise'
  const report = generateExecutiveReport(intel, orgName)

  function handleDownload() {
    setLoading(true)
    setTimeout(() => {
      downloadReport(report)
      setLoading(false)
    }, 800)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          >
            <div className="glass-panel-strong glass-elevated flex max-h-[85vh] flex-col rounded-3xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
                    <FileText className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Executive Report</p>
                    <p className="text-[10px] text-[var(--text-muted)]">AI-generated · {report.generatedAt}</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-full p-2 transition hover:bg-[var(--bg-surface-hover)]"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {report.sections.map((s) => (
                  <div key={s.heading}>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">{s.heading}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export report
                </button>
                <button onClick={onClose} className="rounded-xl border border-[var(--border-subtle)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)]">Close</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/** Compact trigger button for topbar/dashboard */
export function GenerateReportButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/15 to-[var(--secondary)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
        Generate Report
      </button>
      <ExecutiveReportModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
