// File path: app/components/ClientLayout.tsx

'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useSidebarContext } from '@/app/contexts/SidebarContext'
import { FaBars } from 'react-icons/fa' // Assuming you're using react-icons for the toggle icon

// ClientLayout component: Manages the layout structure including a collapsible sidebar
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Get the current pathname to determine if we're on a page that should show the sidebar
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isResetPasswordPage = pathname.startsWith('/reset-password')

  // Use the sidebar context to manage the open/closed state of the sidebar
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarContext()

  // Toggle function to open/close the sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // If we're on the login or reset password page, don't show the sidebar
  if (isLoginPage || isResetPasswordPage) {
    return <>{children}</>
  }

  // Main layout structure with collapsible sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar component with dynamic width based on open/closed state */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with sidebar toggle button */}
        <header className="bg-gray-800 p-4">
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <FaBars size={24} />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}