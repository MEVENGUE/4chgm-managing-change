/**
 * Thin API client for 4CHGM — Managing Change.
 *
 * When NEXT_PUBLIC_API_URL is set (e.g. the FastAPI backend), services call the
 * real API. Otherwise they fall back to local mock data — so the frontend works
 * with zero backend during development.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

export function isApiEnabled(): boolean {
  return BASE_URL.length > 0
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`API ${method} ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body)
}

/**
 * Try the real API when enabled, otherwise resolve with mock data.
 * Falls back to mock if the API call fails, keeping the UI resilient.
 */
export async function withApi<T>(path: string, mock: () => Promise<T> | T): Promise<T> {
  if (!isApiEnabled()) return mock()
  try {
    return await apiGet<T>(path)
  } catch {
    return mock()
  }
}
