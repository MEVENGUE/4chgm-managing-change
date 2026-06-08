'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ShellContextValue = {
  sidebarCollapsed: boolean
  mobileOpen: boolean
  toggleSidebar: () => void
  setMobileOpen: (open: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), [])

  return (
    <ShellContext.Provider
      value={{
        sidebarCollapsed,
        mobileOpen,
        toggleSidebar,
        setMobileOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </ShellContext.Provider>
  )
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within ShellProvider')
  return ctx
}
