'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Send, ArrowRight, FileText, BookOpen, X, Upload, Loader2, Paperclip } from 'lucide-react'
import { useCopilot } from '@/providers/CopilotProvider'
import { QUICK_PROMPTS } from '@/services/ai'
import DataProcessingConsent from '@/components/legal/DataProcessingConsent'
import { hasDataConsent } from '@/lib/dataPolicy'
import { ingestDocument, readFileAsText } from '@/services/knowledge'
import { isApiEnabled } from '@/lib/apiClient'
import { getAccessToken } from '@/services/auth/tokenService'
import { uploadDocumentToApi } from '@/services/documentsApi'
import ArtifactCard from '@/components/ai/ArtifactCard'
import type { AiMessage, AiAction, ChatAttachment } from '@/types/copilot'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function AttachmentChip({ att, onRemove }: { att: ChatAttachment; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2.5 py-1 text-[10px] font-medium text-[var(--text-primary)]">
      <FileText className="h-3 w-3 text-[var(--primary)]" />
      <span className="max-w-[120px] truncate">{att.fileName}</span>
      <span className="text-[var(--text-muted)]">({att.wordCount} mots)</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Retirer" className="text-[var(--text-muted)] hover:text-[var(--danger)]">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

function Bubble({ message, onAction }: { message: AiMessage; onAction: (a: AiAction) => void }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[88%] ${isUser ? '' : 'w-full'}`}>
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap justify-end gap-1">
            {message.attachments.map((a) => (
              <AttachmentChip key={a.id} att={a} />
            ))}
          </div>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
            isUser ? 'bg-[var(--primary)] text-white' : 'border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
          }`}
          style={isUser ? { boxShadow: '0 4px 16px -6px var(--glow-primary)' } : undefined}
        >
          <span className="whitespace-pre-wrap">{message.content}</span>
        </div>

        {!isUser && message.artifact && <ArtifactCard artifact={message.artifact} />}

        {!isUser && message.contextUsed && message.contextUsed.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <BookOpen className="h-3 w-3" /> Sources
            </span>
            {message.contextUsed.slice(0, 5).map((c) => (
              <span key={c} className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[9px] text-[var(--text-secondary)]">
                {c}
              </span>
            ))}
          </div>
        )}

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.citations.map((c) => (
              <div key={c.sourceId} className="flex items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5">
                <FileText className="mt-0.5 h-3 w-3 shrink-0 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[var(--text-primary)]">{c.title}</p>
                  <p className="text-[10px] leading-snug text-[var(--text-muted)]">{c.snippet}</p>
                </div>
                <span className="ml-auto shrink-0 text-[9px] font-bold text-[var(--primary)]">{Math.round(c.score * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.actions.map((a) => (
              <button
                key={a.id}
                onClick={() => onAction(a)}
                className="flex items-center gap-1 rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] transition hover:border-[var(--primary)] hover:gap-1.5"
              >
                {a.label} <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function AiCopilot({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { activeThread, attachments, streaming, sendMessage, attachDocument, removeAttachment, clearAttachments } = useCopilot()
  const [input, setInput] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = activeThread?.messages ?? []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming, attachments])

  function handleAction(a: AiAction) {
    if (a.kind === 'navigate' || a.kind === 'open') router.push(a.payload)
    else sendMessage(a.payload)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() && attachments.length === 0) return
    sendMessage(input)
    setInput('')
  }

  async function handleFileUpload(file: File) {
    setFileError('')
    if (!hasDataConsent()) {
      setFileError('Acceptez la politique de traitement des données IA.')
      return
    }
    setFileLoading(true)
    try {
      let text = ''
      const fileName = file.name

      if (isApiEnabled() && getAccessToken()) {
        const uploaded = await uploadDocumentToApi(file)
        if (uploaded?.extracted_text) {
          text = uploaded.extracted_text
        } else if (uploaded) {
          text = `[Document ${fileName} — indexation en cours sur le serveur]`
        }
      }

      if (!text) {
        try {
          text = await readFileAsText(file)
        } catch {
          setFileError('Format non supporté en local. Connectez l\'API pour PDF/DOCX.')
          return
        }
      }

      const title = fileName.replace(/\.[^.]+$/, '')
      attachDocument({
        title,
        fileName,
        text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        fileType: fileName.split('.').pop(),
      })
      ingestDocument(title, text.slice(0, 50000), 'Copilot upload')
    } catch (e) {
      setFileError(e instanceof Error ? e.message : 'Import impossible')
    } finally {
      setFileLoading(false)
    }
  }

  const docPrompts = attachments.length > 0
    ? [
        'Résume ce document',
        'Quels sont les risques ?',
        'Propose un plan d\'action',
      ]
    : []

  return (
    <div className="glass-panel-strong glass-elevated relative flex h-full flex-col overflow-hidden rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <p className="section-title">AI Copilot</p>
        </div>
        <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[9px] font-semibold tracking-wider text-[var(--primary)]">
          {attachments.length > 0 ? `${attachments.length} DOC` : 'CHAT'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 flex-1 space-y-3 overflow-y-auto scrollbar-hide pr-1"
        style={{ minHeight: compact ? 160 : 280, maxHeight: compact ? 240 : undefined }}
      >
        {messages.map((m) => (
          <Bubble key={m.id} message={m} onAction={handleAction} />
        ))}
        {streaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {messages.length <= 1 && attachments.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.slice(0, compact ? 2 : 4).map((s) => (
              <button
                key={s.id}
                onClick={() => sendMessage(s.prompt)}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
              >
                {s.prompt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {docPrompts.length > 0 && !compact && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {docPrompts.map((p) => (
            <button
              key={p}
              onClick={() => { sendMessage(p); setInput('') }}
              disabled={streaming}
              className="rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-2.5 py-1 text-[10px] font-medium text-[var(--primary)] transition hover:bg-[var(--primary)]/20 disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {attachments.length > 0 && !compact && (
        <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--text-secondary)]">
              <Paperclip className="h-3 w-3" /> Documents actifs dans le chat
            </span>
            <button type="button" onClick={clearAttachments} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)]">
              Tout retirer
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} att={a} onRemove={() => removeAttachment(a.id)} />
            ))}
          </div>
          <p className="mt-1.5 text-[9px] text-[var(--text-muted)]">
            Posez des questions libres — l&apos;IA utilise le contenu de ces documents pour chaque réponse.
          </p>
        </div>
      )}

      {!compact && <DataProcessingConsent compact />}

      {attachments.length > 0 && compact && (
        <div className="mt-2 flex flex-wrap gap-1">
          {attachments.map((a) => (
            <AttachmentChip key={a.id} att={a} onRemove={() => removeAttachment(a.id)} />
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 focus-within:border-[var(--border-medium)]">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.csv,.json,.log,.pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = '' }}
        />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={fileLoading} className="text-[var(--text-muted)] transition hover:text-[var(--primary)]" aria-label="Joindre un fichier">
          {fileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={attachments.length ? 'Posez une question sur le document…' : 'Ask your enterprise copilot…'}
          className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={(!input.trim() && attachments.length === 0) || streaming}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white transition disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
      {fileError && <p className="mt-1 text-[10px] text-[var(--danger)]">{fileError}</p>}
    </div>
  )
}
