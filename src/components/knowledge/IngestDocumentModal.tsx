'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import DataProcessingConsent from '@/components/legal/DataProcessingConsent'
import { hasDataConsent } from '@/lib/dataPolicy'
import { isApiEnabled } from '@/lib/apiClient'
import { getAccessToken } from '@/services/auth/tokenService'
import { uploadDocumentToApi } from '@/services/documentsApi'
import { ingestDocument, readFileAsText } from '@/services/knowledge'

type Props = { open: boolean; onClose: () => void; onIngested: () => void }

export default function IngestDocumentModal({ open, onClose, onIngested }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function handleFile(file: File) {
    setError('')
    setSelectedFile(file)
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
    try {
      const text = await readFileAsText(file)
      setContent(text)
    } catch {
      if (isApiEnabled() && getAccessToken()) {
        setContent(`[Fichier binaire — parsing côté serveur : ${file.name}]`)
      } else {
        setError('Formats supportés en local : .txt, .md, .csv, .json, .log. Connectez l\'API pour PDF/DOCX.')
        setSelectedFile(null)
      }
    }
  }

  function submit() {
    if (!hasDataConsent()) {
      setError('Acceptez la politique de traitement des données IA avant d\'ingérer.')
      return
    }
    if (!title.trim() || !content.trim()) {
      setError('Titre et contenu requis.')
      return
    }
    setLoading(true)
    try {
      if (isApiEnabled() && getAccessToken() && selectedFile) {
        const uploaded = await uploadDocumentToApi(selectedFile)
        if (uploaded?.extracted_text) {
          ingestDocument(title.trim(), uploaded.extracted_text || content.trim(), 'API upload')
        } else if (uploaded) {
          ingestDocument(title.trim(), content.trim(), 'API upload')
        } else {
          ingestDocument(title.trim(), content.trim(), 'User upload')
        }
      } else {
        ingestDocument(title.trim(), content.trim(), 'User upload')
      }
    } finally {
      setLoading(false)
      setTitle('')
      setContent('')
      setSelectedFile(null)
      onIngested()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="glass-panel-strong glass-elevated rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-[var(--primary)]" />
                  <p className="text-sm font-bold">Ingérer un document</p>
                </div>
                <button onClick={onClose} aria-label="Fermer"><X className="h-4 w-4 text-[var(--text-muted)]" /></button>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Le document rejoint votre Knowledge Center, alimente la recherche sémantique, les citations du Copilot et les statistiques Analytics.
              </p>
              <DataProcessingConsent compact />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du document"
                className="mt-4 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Collez le contenu ou importez un fichier .txt, .md, .csv, .json"
                className="mt-3 h-32 w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs outline-none focus:border-[var(--primary)]"
              />
              <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json,.log,.pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 flex items-center gap-2 text-[11px] font-medium text-[var(--primary)]"
              >
                <FileText className="h-3.5 w-3.5" /> Importer un fichier
              </button>
              {error && <p className="mt-2 text-[11px] text-[var(--danger)]">{error}</p>}
              <button
                onClick={submit}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Indexer dans Knowledge Center
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
