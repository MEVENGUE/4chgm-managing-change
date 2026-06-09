import { BRAND } from '@/lib/brand'
import { ingestDocument } from '@/services/knowledge'
import { CONNECTORS, type Connector, type ConnectorStatus } from '@/services/connectors'

const STORAGE_KEY = `${BRAND.storagePrefix}-integrations`

type StoredConnector = {
  status: ConnectorStatus
  records?: number
  lastSync?: string
}

type StoredMap = Record<string, StoredConnector>

const SYNC_PAYLOADS: Record<string, { title: string; content: string; origin: string }> = {
  jira: {
    title: 'Jira Sprint Sync',
    content:
      'Synced sprint backlog and velocity from Jira. Open issues mapped to portfolio initiatives. Cycle time trending down 8% after parallel review policy.',
    origin: 'Jira',
  },
  github: {
    title: 'GitHub Repository Sync',
    content:
      'Repositories, pull requests and workflow runs ingested. Dependency audit flagged 2 remediable vulnerabilities. Deployment frequency aligned with DevOps KPIs.',
    origin: 'GitHub',
  },
  notion: {
    title: 'Notion Workspace Sync',
    content:
      'Documentation pages and program charters synchronized. ERP modernization charter updated with latest stakeholder notes and mitigation actions.',
    origin: 'Notion',
  },
  'azure-devops': {
    title: 'Azure DevOps Sync',
    content:
      'Pipelines, boards and work items imported. Release cadence stable with 94% success rate on main branch builds.',
    origin: 'Azure DevOps',
  },
  slack: {
    title: 'Slack Channel Signals',
    content:
      'Team sentiment and adoption signals aggregated from program channels. Engagement score improved after executive AMA session.',
    origin: 'Slack',
  },
  teams: {
    title: 'Microsoft Teams Sync',
    content:
      'Meeting notes and transformation steering outcomes indexed. Action items linked to at-risk initiatives in the portfolio.',
    origin: 'Microsoft Teams',
  },
  confluence: {
    title: 'Confluence Knowledge Sync',
    content:
      'Architecture decision records and migration runbooks ingested into the knowledge base for Copilot retrieval.',
    origin: 'Confluence',
  },
  sap: {
    title: 'SAP Finance Extract',
    content:
      'Quarterly actuals and forecast lines synchronized. Cost variance on ERP workstream highlighted for steering review.',
    origin: 'SAP',
  },
  servicenow: {
    title: 'ServiceNow Change Records',
    content:
      'ITSM change requests and incident trends imported. Correlates operational risk with portfolio delivery windows.',
    origin: 'ServiceNow',
  },
  gitlab: {
    title: 'GitLab CI/CD Sync',
    content:
      'Merge requests and pipeline metrics ingested. Lead time for changes within target for transformation squads.',
    origin: 'GitLab',
  },
  excel: {
    title: 'Spreadsheet Import',
    content:
      'Budget and initiative tracker spreadsheet parsed. Rows matched to active portfolio initiatives for reconciliation.',
    origin: 'Excel / CSV',
  },
}

function loadStored(): StoredMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredMap) : {}
  } catch {
    return {}
  }
}

function persistStored(map: StoredMap) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function mergeConnectorsWithStored(): Connector[] {
  const stored = loadStored()
  return CONNECTORS.map((c) => {
    const row = stored[c.id]
    if (!row) return { ...c, status: 'available' as ConnectorStatus, records: undefined, lastSync: undefined }
    return { ...c, ...row }
  })
}

function saveConnector(id: string, patch: StoredConnector) {
  const stored = loadStored()
  stored[id] = { ...stored[id], ...patch }
  persistStored(stored)
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function mockConnectIntegration(id: string): Promise<{ ok: boolean }> {
  await delay(700)
  const connector = CONNECTORS.find((c) => c.id === id)
  if (!connector) return { ok: false }
  saveConnector(id, { status: 'connected', records: 120 + Math.floor(Math.random() * 400), lastSync: 'just now' })
  return { ok: true }
}

export async function mockSyncIntegration(id: string): Promise<{ ok: boolean; records: number }> {
  await delay(900)
  const payload = SYNC_PAYLOADS[id] ?? {
    title: `${CONNECTORS.find((c) => c.id === id)?.name ?? id} Sync`,
    content: `Data synchronized from ${id}. Records mapped to portfolio analytics and knowledge retrieval.`,
    origin: CONNECTORS.find((c) => c.id === id)?.name ?? id,
  }
  ingestDocument(payload.title, payload.content, payload.origin)
  const records = (loadStored()[id]?.records ?? 100) + Math.floor(Math.random() * 80) + 20
  saveConnector(id, { status: 'connected', records, lastSync: 'just now' })
  return { ok: true, records }
}

export function mockDisconnectIntegration(id: string) {
  saveConnector(id, { status: 'available', records: undefined, lastSync: undefined })
}
