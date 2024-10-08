'use client'

import { useState } from 'react'
import { UserProvider } from '@/app/contexts/UserContext'
import { SidebarContext } from '@/app/contexts/SidebarContext'
import ClientLayout from './ClientLayout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <UserProvider>
      <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
        <ClientLayout>{children}</ClientLayout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </SidebarContext.Provider>
    </UserProvider>
  )
}