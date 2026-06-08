import type { EngineContext } from '@/services/ai'
import type { AiAction, KnowledgeRef } from '@/types/copilot'
import { isApiEnabled } from '@/lib/apiClient'
import { getAccessToken } from '@/services/auth/tokenService'

const BASE = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

function contextPayload(ctx: EngineContext) {
  return {
    orgName: ctx.orgName,
    industry: ctx.industry,
    goals: ctx.goals,
    workspace: ctx.workspace,
    role: ctx.role,
    portfolio: ctx.portfolio,
  }
}

export type CopilotApiResult = {
  content: string
  threadId: string
  messageId: string
  citations: KnowledgeRef[]
  actions: AiAction[]
  contextUsed: string[]
  mock?: boolean
}

export async function chatRagWithApi(
  prompt: string,
  ctx: EngineContext = {},
  threadId?: string
): Promise<CopilotApiResult | null> {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    const res = await fetch(`${BASE()}/api/v1/copilot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ prompt, threadId, context: contextPayload(ctx), consentAccepted: true }),
    })
    if (!res.ok) return null
    return (await res.json()) as CopilotApiResult
  } catch {
    return null
  }
}

export async function* streamRagWithApi(
  prompt: string,
  ctx: EngineContext = {},
  threadId?: string
): AsyncGenerator<{ type: 'token'; content: string } | { type: 'done'; threadId: string; citations: KnowledgeRef[]; messageId: string }> {
  if (!isApiEnabled() || !getAccessToken()) return
  const res = await fetch(`${BASE()}/api/v1/copilot/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ prompt, threadId, context: contextPayload(ctx), consentAccepted: true }),
  })
  if (!res.ok || !res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const parsed = JSON.parse(line.slice(6))
        yield parsed
      } catch {
        /* ignore */
      }
    }
  }
}

export async function analyzeDocumentRagWithApi(
  title: string,
  content: string,
  ctx: EngineContext = {},
  threadId?: string
): Promise<CopilotApiResult | null> {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    const res = await fetch(`${BASE()}/api/v1/copilot/chat/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        title,
        content: content.slice(0, 50000),
        threadId,
        context: contextPayload(ctx),
        consentAccepted: true,
      }),
    })
    if (!res.ok) return null
    return (await res.json()) as CopilotApiResult
  } catch {
    return null
  }
}

export async function runAgentWithApi(agent: string, query: string) {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    const res = await fetch(`${BASE()}/api/v1/exports/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ agent, query }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
