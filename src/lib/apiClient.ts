/**
 * API client for 4CHGM — Managing Change.
 * When NEXT_PUBLIC_API_URL is set, calls the FastAPI backend with JWT auth.
 */

import { getAccessToken } from '@/services/auth/tokenService'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

export function isApiEnabled(): boolean {
  return BASE_URL.length > 0
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`API ${method} ${path} failed: ${res.status} ${detail}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body)
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PATCH', path, body)
}

export function apiDelete(path: string): Promise<void> {
  return request<void>('DELETE', path)
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const token = getAccessToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function withApi<T>(path: string, mock: () => Promise<T> | T): Promise<T> {
  if (!isApiEnabled()) return mock()
  try {
    return await apiGet<T>(path)
  } catch {
    return mock()
  }
}
