import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFavoritesAndWishlist } from './actions'
import AuthButton from '@/components/AuthButton'
import FavoriteSupermarkets from '@/components/FavoriteSupermarkets'
import WishlistPanel from '@/components/WishlistPanel'
import DashboardFeed from '@/components/DashboardFeed'

export const metadata = { title: 'Mein Dashboard – Deal Radar' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard')
  }

  const { favorites, wishlist } = await getFavoritesAndWishlist()

  return (
    <main className="min-h-screen bg-[#1e1e2e]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#1e1e2e]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl" aria-hidden>📡</span>
            <span className="text-xl font-bold text-white">Deal Radar</span>
          </a>
          <nav className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-orange-400 font-medium">Dashboard</a>
            <AuthButton />
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mein Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        </div>

        {/* Favorite supermarkets widget */}
        <FavoriteSupermarkets favorites={favorites} />

        {/* Personalized deal feed */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            {favorites.length > 0 ? 'Deine Angebote' : 'Alle Angebote'}
          </h2>
          <DashboardFeed favorites={favorites} />
        </section>

        {/* Wishlist */}
        <WishlistPanel items={wishlist} />
      </div>
    </main>
  )
}
