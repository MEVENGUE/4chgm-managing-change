import { isApiEnabled } from '@/lib/apiClient'
import { getAccessToken } from '@/services/auth/tokenService'

const BASE = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

export async function downloadExecutivePdfFromApi(): Promise<Blob | null> {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    const res = await fetch(`${BASE()}/api/v1/exports/executive/download`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    })
    if (!res.ok) return null
    return res.blob()
  } catch {
    return null
  }
}

export async function exportExecutiveReport(orgName: string, format: 'pdf' | 'pptx' = 'pdf') {
  if (!isApiEnabled() || !getAccessToken()) return null
  try {
    const res = await fetch(`${BASE()}/api/v1/exports/executive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ title: '4CHGM Executive Report', orgName, format }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
