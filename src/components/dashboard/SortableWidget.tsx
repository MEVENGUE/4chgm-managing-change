'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, EyeOff } from 'lucide-react'
import type { WidgetId } from '@/lib/dashboardWidgets'
import { useDashboardLayout } from '@/providers/DashboardLayoutProvider'

type Props = {
  id: WidgetId
  className?: string
  children: React.ReactNode
}

export default function SortableWidget({ id, className = '', children }: Props) {
  const { editMode } = useDashboardLayout()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !editMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative ${className}`}>
      {editMode && (
        <div className="absolute -left-1 top-3 z-20 flex items-center gap-1 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-elevated)] px-1 py-0.5 shadow-sm">
          <button type="button" className="cursor-grab p-1 text-[var(--text-muted)] active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <EyeOff className="h-3 w-3 text-[var(--text-muted)]" />
        </div>
      )}
      {children}
    </div>
  )
}
