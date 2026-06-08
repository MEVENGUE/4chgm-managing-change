'use client'

import { LayoutGrid, RotateCcw, Check } from 'lucide-react'
import { useDashboardLayout } from '@/providers/DashboardLayoutProvider'
import { WIDGET_LABELS, type WidgetId } from '@/lib/dashboardWidgets'

export default function DashboardCustomizeBar() {
  const { editMode, setEditMode, layout, toggleWidget, resetLayout } = useDashboardLayout()

  if (!editMode) {
    return (
      <button
        onClick={() => setEditMode(true)}
        className="flex items-center gap-2 rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--primary)] hover:text-[var(--text-primary)]"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Customize
      </button>
    )
  }

  return (
    <div className="glass-panel-strong flex flex-wrap items-center gap-2 rounded-2xl px-4 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">Edit layout</span>
      {layout.order.map((id) => (
        <button
          key={id}
          onClick={() => toggleWidget(id as WidgetId)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
            layout.hidden.includes(id as WidgetId)
              ? 'border border-dashed border-[var(--border-medium)] text-[var(--text-muted)] line-through'
              : 'border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
          }`}
        >
          {WIDGET_LABELS[id as WidgetId]}
        </button>
      ))}
      <button onClick={resetLayout} className="ml-1 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
        <RotateCcw className="h-3 w-3" /> Reset
      </button>
      <button onClick={() => setEditMode(false)} className="flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold text-white">
        <Check className="h-3 w-3" /> Done
      </button>
    </div>
  )
}
