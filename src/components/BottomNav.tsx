'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', label: 'Angebote', icon: '🏷️' },
  { href: '/dashboard', label: 'Dashboard', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password')) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-[#1e1e2e]/95 backdrop-blur-sm border-t border-white/5 pb-safe"
      aria-label="Hauptnavigation"
    >
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
