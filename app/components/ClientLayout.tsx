'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaDoorOpen, FaGift, FaHome, FaPlusCircle, FaUser } from 'react-icons/fa'

const navItems = [
  { name: 'Home', path: '/dashboard/stats', icon: FaHome },
  { name: 'Log', path: '/actions', icon: FaPlusCircle },
  { name: 'Rooms', path: '/rooms', icon: FaDoorOpen },
  { name: 'Rewards', path: '/rewards', icon: FaGift },
  { name: 'Profile', path: '/profile', icon: FaUser },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  const isLoginPage = pathname === '/login'
  const isResetPasswordPage = pathname.startsWith('/reset-password')
  const isHomeActive = (path: string) => (
    path === '/dashboard/stats'
      ? pathname === '/dashboard' || pathname === '/dashboard/stats'
      : pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isLandingPage || isLoginPage || isResetPasswordPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="min-h-screen overflow-x-hidden bg-gray-900 px-3 pb-24 pt-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-700 bg-gray-900/95 px-2 pb-3 pt-2 backdrop-blur sm:px-4">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isHomeActive(item.path)

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex min-h-14 flex-col items-center justify-center rounded-md px-2 text-xs font-medium transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="mb-1 h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
