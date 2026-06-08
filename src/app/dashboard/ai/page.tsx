'use client'

import { Bot } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import AiCopilot from '@/components/ai/AiCopilot'
import ThreadSidebar from '@/components/ai/ThreadSidebar'
import KnowledgePanel from '@/components/ai/KnowledgePanel'

export default function AiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bot}
        title="AI Copilot"
        subtitle="Enterprise intelligence grounded in your organization's knowledge"
      />
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: 'minmax(0, 1fr)', minHeight: 'calc(100vh - 220px)' }}
      >
        <div className="grid gap-6 lg:[grid-template-columns:260px_minmax(0,1fr)_300px]">
          <div className="hidden lg:block" style={{ height: 'calc(100vh - 220px)' }}>
            <ThreadSidebar />
          </div>
          <div style={{ height: 'calc(100vh - 220px)' }}>
            <AiCopilot />
          </div>
          <div className="hidden lg:block">
            <KnowledgePanel />
          </div>
        </div>
      </div>
    </div>
  )
}
