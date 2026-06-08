'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useOrganization } from '@/providers/OrganizationProvider'
import {
  DEFAULT_WIDGET_LAYOUT,
  layoutStorageKey,
  type WidgetId,
  type WidgetLayout,
} from '@/lib/dashboardWidgets'

type DashboardLayoutContextValue = {
  layout: WidgetLayout
  editMode: boolean
  setEditMode: (v: boolean) => void
  reorder: (activeId: WidgetId, overId: WidgetId) => void
  toggleWidget: (id: WidgetId) => void
  resetLayout: () => void
  visibleOrder: WidgetId[]
}

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null)

function loadLayout(workspaceId: string): WidgetLayout {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_LAYOUT
  try {
    const raw = localStorage.getItem(layoutStorageKey(workspaceId))
    if (!raw) return DEFAULT_WIDGET_LAYOUT
    const parsed = JSON.parse(raw) as WidgetLayout
    return {
      order: parsed.order?.length ? parsed.order : DEFAULT_WIDGET_LAYOUT.order,
      hidden: parsed.hidden ?? [],
    }
  } catch {
    return DEFAULT_WIDGET_LAYOUT
  }
}

function persistLayout(workspaceId: string, layout: WidgetLayout) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(layoutStorageKey(workspaceId), JSON.stringify(layout))
  } catch {
    /* ignore */
  }
}

export function DashboardLayoutProvider({ children }: { children: React.ReactNode }) {
  const { activeWorkspace } = useOrganization()
  const [layout, setLayout] = useState<WidgetLayout>(DEFAULT_WIDGET_LAYOUT)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    setLayout(loadLayout(activeWorkspace.id))
    setEditMode(false)
  }, [activeWorkspace.id])

  const save = useCallback(
    (next: WidgetLayout) => {
      setLayout(next)
      persistLayout(activeWorkspace.id, next)
    },
    [activeWorkspace.id]
  )

  const reorder = useCallback(
    (activeId: WidgetId, overId: WidgetId) => {
      if (activeId === overId) return
      const order = [...layout.order]
      const from = order.indexOf(activeId)
      const to = order.indexOf(overId)
      if (from < 0 || to < 0) return
      order.splice(from, 1)
      order.splice(to, 0, activeId)
      save({ ...layout, order })
    },
    [layout, save]
  )

  const toggleWidget = useCallback(
    (id: WidgetId) => {
      const hidden = layout.hidden.includes(id)
        ? layout.hidden.filter((h) => h !== id)
        : [...layout.hidden, id]
      save({ ...layout, hidden })
    },
    [layout, save]
  )

  const resetLayout = useCallback(() => save(DEFAULT_WIDGET_LAYOUT), [save])

  const visibleOrder = useMemo(
    () => layout.order.filter((id) => !layout.hidden.includes(id)),
    [layout]
  )

  const value = useMemo(
    () => ({ layout, editMode, setEditMode, reorder, toggleWidget, resetLayout, visibleOrder }),
    [layout, editMode, reorder, toggleWidget, resetLayout, visibleOrder]
  )

  return <DashboardLayoutContext.Provider value={value}>{children}</DashboardLayoutContext.Provider>
}

export function useDashboardLayout() {
  const ctx = useContext(DashboardLayoutContext)
  if (!ctx) throw new Error('useDashboardLayout must be used within DashboardLayoutProvider')
  return ctx
}
