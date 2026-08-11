'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaShieldAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useUser } from '@/app/contexts/UserContext'
import { createClient } from '@/utils/supabase/client'

export default function AccountMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useUser()
  const supabase = useMemo(() => createClient(), [])
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Failed to sign out')
      setIsSigningOut(false)
      return
    }

    setIsOpen(false)
    router.replace('/login')
    router.refresh()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-600 bg-gray-800 text-white shadow-md transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Account"
      >
        <FaUser className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-gray-700 bg-gray-800 shadow-xl"
        >
          <div className="border-b border-gray-700 px-4 py-3">
            <p className="text-sm font-semibold text-white">Account</p>
            <p className="mt-1 truncate text-xs text-gray-400">
              {isLoading ? 'Loading account...' : user?.email ?? 'Signed in'}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/admin"
              role="menuitem"
              className="flex min-h-11 items-center gap-3 rounded px-3 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaShieldAlt className="h-4 w-4 text-blue-300" aria-hidden="true" />
              Admin
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-1 flex min-h-11 w-full items-center gap-3 rounded px-3 py-2 text-left text-sm font-medium text-red-200 transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSignOutAlt className="h-4 w-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
