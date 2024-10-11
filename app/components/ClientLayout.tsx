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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 text-white p-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <FaBars size={24} />
          </button>
      
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}