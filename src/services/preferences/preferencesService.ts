import { BRAND } from '@/lib/brand'
import type { Locale } from '@/i18n/config'

export type UserPreferences = {
  theme: 'dark' | 'light'
  density: 'comfortable' | 'compact'
  animations: boolean
  defaultWorkspaceId: string
  language: Locale
  notifications: {
    email: boolean
    aiInsights: boolean
    projectAlerts: boolean
    riskAlerts: boolean
    weeklyReports: boolean
    pipelineAlerts: boolean
  }
}

const KEY = `${BRAND.storagePrefix}-preferences`

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  density: 'comfortable',
  animations: true,
  defaultWorkspaceId: 'exec',
  language: 'en',
  notifications: {
    email: true,
    aiInsights: true,
    projectAlerts: true,
    riskAlerts: true,
    weeklyReports: false,
    pipelineAlerts: true,
  },
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem('nexora-preferences')
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFERENCES
}

export function savePreferences(prefs: Partial<UserPreferences>) {
  const next = { ...loadPreferences(), ...prefs }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}
