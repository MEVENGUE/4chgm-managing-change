'use client'

import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { useCopilot } from '@/providers/CopilotProvider'

export default function ThreadSidebar() {
  const { threads, activeThreadId, newThread, selectThread, deleteThread } = useCopilot()

  return (
    <div className="glass-panel-strong flex h-full flex-col rounded-3xl p-4">
      <button
        onClick={newThread}
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> New conversation
      </button>

      <p className="mb-2 mt-5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">History</p>
      <div className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {threads.map((t) => {
          const active = t.id === activeThreadId
          return (
            <div
              key={t.id}
              className="group flex items-center gap-2 rounded-xl px-2.5 py-2 transition"
              style={{ background: active ? 'var(--sidebar-item-active)' : 'transparent' }}
            >
              <button onClick={() => selectThread(t.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span className={`truncate text-xs ${active ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {t.title || 'New conversation'}
                </span>
              </button>
              <button
                onClick={() => deleteThread(t.id)}
                className="opacity-0 transition group-hover:opacity-100"
                aria-label="Supprimer la conversation"
              >
                <Trash2 className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--danger)]" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
