export type ConnectorStatus = 'connected' | 'syncing' | 'available' | 'error'

export type Connector = {
  id: string
  name: string
  category: 'Project' | 'DevOps' | 'ERP' | 'Docs' | 'Comms' | 'Data'
  description: string
  status: ConnectorStatus
  records?: number
  lastSync?: string
  accent: string
}

export const CONNECTORS: Connector[] = [
  { id: 'jira', name: 'Jira', category: 'Project', description: 'Issues, sprints & velocity', status: 'connected', records: 12840, lastSync: '2m ago', accent: '#2684ff' },
  { id: 'azure-devops', name: 'Azure DevOps', category: 'DevOps', description: 'Pipelines, repos & boards', status: 'connected', records: 8420, lastSync: '5m ago', accent: '#0078d4' },
  { id: 'github', name: 'GitHub', category: 'DevOps', description: 'Repositories, PRs & actions', status: 'syncing', records: 5310, lastSync: 'syncing…', accent: '#8b5cf6' },
  { id: 'gitlab', name: 'GitLab', category: 'DevOps', description: 'CI/CD & merge requests', status: 'available', accent: '#fc6d26' },
  { id: 'sap', name: 'SAP', category: 'ERP', description: 'Finance & operations data', status: 'available', accent: '#0faaff' },
  { id: 'servicenow', name: 'ServiceNow', category: 'ERP', description: 'ITSM & change requests', status: 'available', accent: '#62d84e' },
  { id: 'excel', name: 'Excel / CSV', category: 'Data', description: 'Spreadsheets & flat files', status: 'connected', records: 24, lastSync: '1h ago', accent: '#22c55e' },
  { id: 'notion', name: 'Notion', category: 'Docs', description: 'Docs, wikis & databases', status: 'error', lastSync: 'auth expired', accent: '#e2e2e2' },
  { id: 'slack', name: 'Slack', category: 'Comms', description: 'Channels & team signals', status: 'connected', records: 1920, lastSync: '8m ago', accent: '#e01e5a' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Comms', description: 'Meetings & collaboration', status: 'available', accent: '#6264a7' },
  { id: 'confluence', name: 'Confluence', category: 'Docs', description: 'Knowledge base & specs', status: 'available', accent: '#1868db' },
]

export async function fetchConnectors(): Promise<Connector[]> {
  await new Promise((r) => setTimeout(r, 200))
  return CONNECTORS
}
