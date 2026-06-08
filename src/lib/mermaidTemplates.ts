export type MermaidTemplate = {
  id: string
  label: string
  category: string
  code: string
}

export const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    id: 'transformation',
    label: 'Transformation Flow',
    category: 'Strategy',
    code: `graph TD
  A[Business Need] --> B[Assessment]
  B --> C[Strategy]
  C --> D[Implementation]
  D --> E[Migration]
  E --> F[Optimization]
  F --> G[Value Realization]`,
  },
  {
    id: 'architecture',
    label: 'Cloud Architecture',
    category: 'Architecture',
    code: `graph LR
  U[Users] --> CDN[CDN]
  CDN --> LB[Load Balancer]
  LB --> API[API Gateway]
  API --> S1[Service A]
  API --> S2[Service B]
  S1 --> DB[(Database)]
  S2 --> Cache[(Redis)]
  S2 --> Q[Message Queue]`,
  },
  {
    id: 'scrum',
    label: 'Scrum Workflow',
    category: 'Agile',
    code: `graph LR
  PB[Product Backlog] --> SP[Sprint Planning]
  SP --> SB[Sprint Backlog]
  SB --> DEV[Development]
  DEV --> DS[Daily Standup]
  DS --> DEV
  DEV --> REV[Sprint Review]
  REV --> RET[Retrospective]
  RET --> PB`,
  },
  {
    id: 'devops',
    label: 'DevOps Pipeline',
    category: 'DevOps',
    code: `graph LR
  C[Commit] --> B[Build]
  B --> T[Test]
  T --> SEC[Security Scan]
  SEC --> ST[Staging]
  ST --> APP{Approval}
  APP -->|Yes| PROD[Production]
  APP -->|No| DEV[Back to Dev]
  PROD --> MON[Monitor]`,
  },
  {
    id: 'sequence',
    label: 'Auth Sequence',
    category: 'Architecture',
    code: `sequenceDiagram
  participant U as User
  participant A as App
  participant Auth as Auth Service
  participant DB as Database
  U->>A: Login request
  A->>Auth: Validate credentials
  Auth->>DB: Query user
  DB-->>Auth: User record
  Auth-->>A: JWT token
  A-->>U: Authenticated`,
  },
  {
    id: 'roadmap',
    label: 'Initiative Journey',
    category: 'Strategy',
    code: `journey
  title Transformation Journey
  section Assess
    Audit current state: 4: Team
    Define vision: 5: Leadership
  section Build
    Implement platform: 3: Team
    Migrate workloads: 2: Team
  section Scale
    Optimize costs: 4: Team
    Realize value: 5: Leadership`,
  },
]
