'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useOrganization } from '@/providers/OrganizationProvider'
import { useProjects } from '@/providers/ProjectsProvider'
import { forecastPortfolio } from '@/lib/insights'
import {
  generateAnswer,
  answerForDocument,
  streamAnswerText,
  type EngineContext,
  type EngineResult,
} from '@/services/ai'
import { chatWithApi, analyzeDocumentWithApi } from '@/services/aiApi'
import { hasDataConsent } from '@/lib/dataPolicy'
import { retrieve } from '@/services/knowledge'
import type { AiThread, AiMessage } from '@/types/copilot'

const STORAGE_KEY = '4chgm-copilot'

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
          'Hello — I am your 4CHGM copilot. I have indexed your organization profile and enterprise knowledge base. Ask me to optimize cost, explain risks, summarize a sprint, or generate a transformation roadmap.',
        timestamp: now,
      },
    ],
  }
}

type CopilotContextValue = {
  ready: boolean
  threads: AiThread[]
  activeThreadId: string
  activeThread: AiThread
  streaming: boolean
  newThread: () => void
  selectThread: (id: string) => void
  deleteThread: (id: string) => void
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

  const runStream = useCallback(
    async (threadId: string, userMsg: AiMessage, result: ReturnType<typeof generateAnswer>) => {
      // Set thread title from first user message
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
    async (prompt: string, docMode: { title: string; text: string } | null): Promise<EngineResult> => {
      if (docMode) {
        const api = await analyzeDocumentWithApi(docMode.title, docMode.text, ctx, hasDataConsent())
        if (api?.content) {
          const citations = retrieve(docMode.text)
          return {
            content: api.content + (api.mock ? '\n\n_(Mode mock — vérifiez OPENAI_API_KEY sur Railway)_' : ''),
            citations,
            contextUsed: ['Document upload', 'OpenAI analysis', ...citations.map((c) => c.title)],
            actions: [{ id: 'a1', label: 'Open Knowledge Center', kind: 'navigate', payload: '/dashboard/knowledge' }],
          }
        }
        return answerForDocument(docMode.text, ctx)
      }
      const api = await chatWithApi(prompt, ctx)
      if (api?.content) {
        const citations = retrieve(prompt)
        const mock = generateAnswer(prompt, ctx)
        return {
          content: api.content + (api.mock ? '\n\n_(Réponse mock — OPENAI_API_KEY non configurée)_' : ''),
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
      if (!value || streaming || !activeThreadId) return
      const userMsg: AiMessage = { id: `u-${Date.now()}`, role: 'user', content: value, timestamp: new Date().toISOString() }
      const result = await resolveAnswer(value, null)
      await runStream(activeThreadId, userMsg, result)
    },
    [streaming, activeThreadId, resolveAnswer, runStream]
  )

  const sendDocument = useCallback(
    async (title: string, docText: string) => {
      const value = docText.trim()
      if (!value || streaming || !activeThreadId) return
      if (!hasDataConsent()) return
      const userMsg: AiMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: `📎 Document: ${title || 'Untitled'} (${value.split(/\s+/).length} words)`,
        timestamp: new Date().toISOString(),
      }
      const result = await resolveAnswer('', { title: title || 'Untitled', text: value })
      await runStream(activeThreadId, userMsg, result)
    },
    [streaming, activeThreadId, resolveAnswer, runStream]
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

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0] ?? welcomeThread(),
    [threads, activeThreadId]
  )

  const value = useMemo(
    () => ({ ready, threads, activeThreadId, activeThread, streaming, newThread, selectThread, deleteThread, sendMessage, sendDocument }),
    [ready, threads, activeThreadId, activeThread, streaming, newThread, selectThread, deleteThread, sendMessage, sendDocument]
  )

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
}

export function useCopilot() {
  const ctx = useContext(CopilotContext)
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider')
  return ctx
}
