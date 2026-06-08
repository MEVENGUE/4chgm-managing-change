'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useOrganization } from '@/providers/OrganizationProvider'
import { useProjects } from '@/providers/ProjectsProvider'
import { forecastPortfolio } from '@/lib/insights'
import {
  generateAnswer,
  generateAnswerWithAttachments,
  streamAnswerText,
  type EngineContext,
  type EngineResult,
} from '@/services/ai'
import { chatWithApi } from '@/services/aiApi'
import { streamRagWithApi } from '@/services/copilotApi'
import { getAccessToken } from '@/services/auth/tokenService'
import { isApiEnabled } from '@/lib/apiClient'
import { hasDataConsent } from '@/lib/dataPolicy'
import { retrieve } from '@/services/knowledge'
import type { AiThread, AiMessage, ChatAttachment } from '@/types/copilot'

const STORAGE_KEY = '4chgm-copilot'
const MAX_ATTACHMENTS = 3

function welcomeThread(): AiThread {
  const now = new Date().toISOString()
  return {
    id: `t-${Date.now()}`,
    title: 'New conversation',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: 'm-welcome',
        role: 'assistant',
        content:
          'Bonjour — je suis votre copilot 4CHGM. Importez un document (📎), posez vos questions en continu : résumé, risques, plan d\'action… Le document reste actif dans la conversation.',
        timestamp: now,
      },
    ],
    attachments: [],
  }
}

type CopilotContextValue = {
  ready: boolean
  threads: AiThread[]
  activeThreadId: string
  activeThread: AiThread
  attachments: ChatAttachment[]
  streaming: boolean
  newThread: () => void
  selectThread: (id: string) => void
  deleteThread: (id: string) => void
  attachDocument: (att: Omit<ChatAttachment, 'id' | 'uploadedAt'>) => void
  removeAttachment: (id: string) => void
  clearAttachments: () => void
  sendMessage: (text: string) => Promise<void>
  sendDocument: (title: string, text: string) => Promise<void>
}

const CopilotContext = createContext<CopilotContextValue | null>(null)

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  const { organization, activeWorkspace } = useOrganization()
  const { initiatives } = useProjects()
  const [ready, setReady] = useState(false)
  const [threads, setThreads] = useState<AiThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState('')
  const [streaming, setStreaming] = useState(false)
  const persistRef = useRef<AiThread[]>([])

  useEffect(() => {
    let loaded: AiThread[] = []
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('nexora-copilot')
      if (raw) loaded = JSON.parse(raw) as AiThread[]
    } catch {
      /* ignore */
    }
    loaded = loaded.map((t) => ({ ...t, attachments: t.attachments ?? [] }))
    if (loaded.length === 0) loaded = [welcomeThread()]
    setThreads(loaded)
    setActiveThreadId(loaded[0].id)
    persistRef.current = loaded
    setReady(true)
  }, [])

  const persist = useCallback((next: AiThread[]) => {
    persistRef.current = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 30)))
    } catch {
      /* ignore */
    }
  }, [])

  const ctx: EngineContext = useMemo(() => {
    const f = forecastPortfolio(initiatives)
    return {
      orgName: organization.onboarded ? organization.name : undefined,
      industry: organization.industry,
      goals: organization.goals,
      workspace: activeWorkspace?.name,
      role: activeWorkspace?.role,
      portfolio: { total: initiatives.length, atRisk: f.atRiskCount, avgHealth: f.avgHealth, overrunPct: f.overrunPct },
    }
  }, [organization, activeWorkspace, initiatives])

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0] ?? welcomeThread(),
    [threads, activeThreadId]
  )

  const attachments = activeThread.attachments ?? []

  const updateThread = useCallback(
    (threadId: string, updater: (t: AiThread) => AiThread, save = false) => {
      setThreads((prev) => {
        const next = prev.map((t) => (t.id === threadId ? updater(t) : t))
        if (save) persist(next)
        return next
      })
    },
    [persist]
  )

  const attachDocument = useCallback(
    (att: Omit<ChatAttachment, 'id' | 'uploadedAt'>) => {
      if (!hasDataConsent()) return
      const item: ChatAttachment = {
        ...att,
        id: `att-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      }
      updateThread(
        activeThreadId,
        (t) => ({
          ...t,
          attachments: [...(t.attachments ?? []).filter((a) => a.fileName !== item.fileName), item].slice(-MAX_ATTACHMENTS),
        }),
        true
      )
    },
    [activeThreadId, updateThread]
  )

  const removeAttachment = useCallback(
    (id: string) => {
      updateThread(activeThreadId, (t) => ({ ...t, attachments: (t.attachments ?? []).filter((a) => a.id !== id) }), true)
    },
    [activeThreadId, updateThread]
  )

  const clearAttachments = useCallback(() => {
    updateThread(activeThreadId, (t) => ({ ...t, attachments: [] }), true)
  }, [activeThreadId, updateThread])

  const runStreamFromApi = useCallback(
    async (threadId: string, userMsg: AiMessage, prompt: string, threadAttachments: ChatAttachment[]) => {
      updateThread(threadId, (t) => ({
        ...t,
        title: t.messages.filter((m) => m.role === 'user').length === 0 ? userMsg.content.slice(0, 40) : t.title,
        updatedAt: new Date().toISOString(),
        messages: [...t.messages, userMsg],
      }))
      setStreaming(true)
      const assistantId = `a-${Date.now()}`
      let full = ''
      let citations = retrieve(prompt + threadAttachments.map((a) => a.text).join(' ').slice(0, 300))
      let doneMeta: { threadId?: string; citations?: typeof citations } = {}
      for await (const event of streamRagWithApi(prompt, ctx, threadId, threadAttachments)) {
        if (event.type === 'token') {
          full += event.content
          if (full.trim()) {
            updateThread(threadId, (t) => {
              const exists = t.messages.some((m) => m.id === assistantId)
              return {
                ...t,
                messages: exists
                  ? t.messages.map((m) => (m.id === assistantId ? { ...m, content: full } : m))
                  : [...t.messages, { id: assistantId, role: 'assistant' as const, content: full, timestamp: new Date().toISOString() }],
              }
            })
          }
        } else if (event.type === 'done') {
          citations = event.citations?.length ? event.citations : citations
          doneMeta = event
        }
      }
      const mock = threadAttachments.length
        ? generateAnswerWithAttachments(prompt, threadAttachments, ctx)
        : generateAnswer(prompt, ctx)
      updateThread(
        threadId,
        (t) => ({
          ...t,
          updatedAt: new Date().toISOString(),
          messages: t.messages.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  citations,
                  actions: mock.actions,
                  artifact: mock.artifact,
                  contextUsed: [
                    'RAG stream',
                    'OpenAI',
                    ...threadAttachments.map((a) => a.title),
                    ...citations.map((c) => c.title),
                  ],
                }
              : m
          ),
        }),
        true
      )
      if (doneMeta.threadId) setActiveThreadId(doneMeta.threadId)
      setStreaming(false)
    },
    [ctx, updateThread]
  )

  const runStream = useCallback(
    async (threadId: string, userMsg: AiMessage, result: EngineResult) => {
      updateThread(threadId, (t) => ({
        ...t,
        title: t.messages.filter((m) => m.role === 'user').length === 0 ? userMsg.content.slice(0, 40) : t.title,
        updatedAt: new Date().toISOString(),
        messages: [...t.messages, userMsg],
      }))
      setStreaming(true)
      const assistantId = `a-${Date.now()}`
      let appended = false
      for await (const partial of streamAnswerText(result.content)) {
        if (!appended) {
          appended = true
          updateThread(threadId, (t) => ({
            ...t,
            messages: [...t.messages, { id: assistantId, role: 'assistant', content: partial, timestamp: new Date().toISOString() }],
          }))
        } else {
          updateThread(threadId, (t) => ({
            ...t,
            messages: t.messages.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
          }))
        }
      }
      updateThread(
        threadId,
        (t) => ({
          ...t,
          updatedAt: new Date().toISOString(),
          messages: t.messages.map((m) =>
            m.id === assistantId
              ? { ...m, citations: result.citations, actions: result.actions, artifact: result.artifact, contextUsed: result.contextUsed }
              : m
          ),
        }),
        true
      )
      setStreaming(false)
    },
    [updateThread]
  )

  const resolveAnswer = useCallback(
    async (prompt: string, threadAttachments: ChatAttachment[]): Promise<EngineResult> => {
      if (threadAttachments.length > 0) {
        return generateAnswerWithAttachments(prompt, threadAttachments, ctx)
      }
      const api = await chatWithApi(prompt, ctx)
      if (api?.content) {
        const citations = retrieve(prompt)
        const mock = generateAnswer(prompt, ctx)
        return {
          content: api.content + (api.mock ? '\n\n_(Mode mock — OPENAI_API_KEY)_' : ''),
          citations,
          contextUsed: ['OpenAI', 'Organization profile', ...citations.map((c) => c.title)],
          actions: mock.actions,
          artifact: mock.artifact,
        }
      }
      return generateAnswer(prompt, ctx)
    },
    [ctx]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const value = text.trim()
      const threadAttachments = attachments
      if ((!value && threadAttachments.length === 0) || streaming || !activeThreadId) return

      const displayContent = value || `Analyse le(s) document(s) joint(s) : ${threadAttachments.map((a) => a.title).join(', ')}`
      const prompt = value || 'Analyse les documents joints. Résume les points clés, les risques et propose des actions.'

      const userMsg: AiMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: displayContent,
        timestamp: new Date().toISOString(),
        attachments: threadAttachments.length ? [...threadAttachments] : undefined,
      }

      if (isApiEnabled() && getAccessToken()) {
        await runStreamFromApi(activeThreadId, userMsg, prompt, threadAttachments)
        return
      }
      const result = await resolveAnswer(prompt, threadAttachments)
      await runStream(activeThreadId, userMsg, result)
    },
    [streaming, activeThreadId, attachments, resolveAnswer, runStream, runStreamFromApi]
  )

  const sendDocument = useCallback(
    async (title: string, docText: string) => {
      const value = docText.trim()
      if (!value || streaming || !activeThreadId) return
      if (!hasDataConsent()) return
      attachDocument({
        title: title || 'Document',
        fileName: title || 'document.txt',
        text: value,
        wordCount: value.split(/\s+/).length,
      })
      await sendMessage('Résume ce document et identifie les risques et actions prioritaires.')
    },
    [streaming, activeThreadId, attachDocument, sendMessage]
  )

  const newThread = useCallback(() => {
    const t = welcomeThread()
    setThreads((prev) => {
      const next = [t, ...prev]
      persist(next)
      return next
    })
    setActiveThreadId(t.id)
  }, [persist])

  const selectThread = useCallback((id: string) => setActiveThreadId(id), [])

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => {
        const filtered = prev.filter((t) => t.id !== id)
        const next = filtered.length ? filtered : [welcomeThread()]
        persist(next)
        setActiveThreadId((cur) => (cur === id ? next[0].id : cur))
        return next
      })
    },
    [persist]
  )

  const value = useMemo(
    () => ({
      ready,
      threads,
      activeThreadId,
      activeThread,
      attachments,
      streaming,
      newThread,
      selectThread,
      deleteThread,
      attachDocument,
      removeAttachment,
      clearAttachments,
      sendMessage,
      sendDocument,
    }),
    [
      ready,
      threads,
      activeThreadId,
      activeThread,
      attachments,
      streaming,
      newThread,
      selectThread,
      deleteThread,
      attachDocument,
      removeAttachment,
      clearAttachments,
      sendMessage,
      sendDocument,
    ]
  )

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
}

export function useCopilot() {
  const ctx = useContext(CopilotContext)
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider')
  return ctx
}
