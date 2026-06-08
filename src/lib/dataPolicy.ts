/** Politique de traitement des données utilisateur pour les services IA. */

export const DATA_POLICY_VERSION = '1.0'

export const DATA_POLICY_STORAGE_KEY = '4chgm-ai-data-consent'

export const DATA_POLICY_SUMMARY = {
  title: 'Politique de traitement des données IA',
  purposes: [
    'Personnaliser les réponses du copilot selon votre organisation, portfolio et documents',
    'Analyser les fichiers que vous importez pour en extraire résumés et recommandations',
    'Améliorer les citations du Knowledge Center et les statistiques de transformation',
  ],
  dataProcessed: [
    'Messages du copilot et contexte organisationnel (workspace, initiatives)',
    'Contenu des documents importés (texte) — traités via OpenAI sur Railway',
    'Métadonnées de session (horodatage, consentement)',
  ],
  retention: 'Les documents ingérés sont stockés localement dans votre navigateur (localStorage). Les requêtes IA transitent vers le backend Railway et ne sont pas persistées côté serveur au-delà du traitement.',
  thirdParties: ['OpenAI (modèle configuré via OPENAI_MODEL) — uniquement si OPENAI_API_KEY est définie'],
  rights: ['Refuser le consentement bloque l\'upload IA mais pas la navigation', 'Supprimer les documents ingérés depuis Knowledge Center', 'Exporter vos initiatives depuis Projects'],
}

export function hasDataConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(DATA_POLICY_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { version: string; acceptedAt: string }
    return parsed.version === DATA_POLICY_VERSION
  } catch {
    return false
  }
}

export function acceptDataConsent(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    DATA_POLICY_STORAGE_KEY,
    JSON.stringify({ version: DATA_POLICY_VERSION, acceptedAt: new Date().toISOString() })
  )
}

export function revokeDataConsent(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DATA_POLICY_STORAGE_KEY)
}
