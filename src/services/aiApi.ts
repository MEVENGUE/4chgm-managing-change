import type { EngineContext } from '@/services/ai'
import { isApiEnabled, apiPost } from '@/lib/apiClient'

export type AiApiResponse = {
  content: string
  model?: string
  mock?: boolean
}

export type MermaidApiResponse = {
  code: string
  note: string
  mock?: boolean
}

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

export async function chatWithApi(prompt: string, ctx: EngineContext = {}): Promise<AiApiResponse | null> {
  if (!isApiEnabled()) return null
  try {
    return await apiPost<AiApiResponse>('/api/ai/chat', {
      prompt,
      context: contextPayload(ctx),
      consentAccepted: true,
    })
  } catch {
    return null
  }
}

export async function analyzeDocumentWithApi(
  title: string,
  content: string,
  ctx: EngineContext = {},
  consentAccepted: boolean
): Promise<AiApiResponse | null> {
  if (!isApiEnabled() || !consentAccepted) return null
  try {
    return await apiPost<AiApiResponse>('/api/ai/analyze-document', {
      title,
      content: content.slice(0, 50000),
      context: contextPayload(ctx),
      consentAccepted,
    })
  } catch {
    return null
  }
}

export async function generateMermaidWithApi(prompt: string, context?: string): Promise<MermaidApiResponse | null> {
  if (!isApiEnabled()) return null
  try {
    return await apiPost<MermaidApiResponse>('/api/ai/mermaid', {
      prompt,
      context: context?.slice(0, 8000),
      consentAccepted: true,
    })
  } catch {
    return null
  }
}
