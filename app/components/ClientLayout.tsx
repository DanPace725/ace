// File path: app/components/ClientLayout.tsx

'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isResetPasswordPage = pathname.startsWith('/reset-password')

  if (isLoginPage || isResetPasswordPage) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}