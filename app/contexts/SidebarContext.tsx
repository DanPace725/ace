import { createContext, useContext } from 'react'

type SidebarContextType = {
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}