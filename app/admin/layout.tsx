'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isAdminSessionUnlocked } from '@/utils/adminLock'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [canRender, setCanRender] = useState(pathname === '/admin/unlock')

  useEffect(() => {
    if (pathname === '/admin/unlock') {
      setCanRender(true)
      return
    }

    if (isAdminSessionUnlocked()) {
      setCanRender(true)
      return
    }

    setCanRender(false)
    router.replace(`/admin/unlock?next=${encodeURIComponent(pathname)}`)
  }, [pathname, router])

  if (!canRender) {
    return (
      <div className="mx-auto max-w-md rounded-md bg-gray-800 p-5 text-gray-300">
        Checking admin access...
      </div>
    )
  }

  return <>{children}</>
}
