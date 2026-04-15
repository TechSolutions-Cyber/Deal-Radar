'use client'

import { useEffect, useState, useTransition } from 'react'
import { fetchDeals } from '@/lib/api'
import { addToWishlist } from '@/app/dashboard/actions'
import type { Deal } from '@/types/deal'

interface DashboardFeedProps {
  favorites: string[]
}

export default function DashboardFeed({ favorites }: DashboardFeedProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Load wishlist state from localStorage for offline fallback
  const [localWishlist, setLocalWishlist] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('deal-radar-wishlist')
    if (stored) {
      try { setLocalWishlist(new Set(JSON.parse(stored))) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchDeals(favorites.length > 0 ? { supermarkets: favorites } : undefined)
      .then(setDeals)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [favorites])

  function handleWishlist(deal: Deal) {
    const next = new Set(localWishlist)
    if (next.has(deal.id)) {
      next.delete(deal.id)
    } else {
      next.add(deal.id)
      // Sync to Supabase (best-effort)
      startTransition(() => { addToWishlist(deal).catch(() => {}) })
    }
    setLocalWishlist(next)
    localStorage.setItem('deal-radar-wishlist', JSON.stringify([...next]))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton min-h-[220px] rounded-xl" />
        ))}
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="bg-[#2a2a3e] rounded-xl p-8 text-center border border-white/5">
        <span className="text-4xl block mb-3">🛒</span>
        <p className="text-gray-400 text-sm">Keine Angebote gefunden.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {deals.map((deal) => {
        const inWishlist = localWishlist.has(deal.id)
        return (
          <div
            key={deal.id}
            className="bg-[#2a2a3e] rounded-xl p-3 border border-white/5 relative flex flex-col gap-2"
          >
            {deal.imageUrl && (
              <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{deal.title}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-orange-400 font-bold text-sm">
                  {deal.price.toFixed(2).replace('.', ',')} €
                </span>
                {deal.discountPercent && (
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                    -{deal.discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{deal.supermarket}</p>
            </div>
            <button
              disabled={isPending}
              onClick={() => handleWishlist(deal)}
              className={`absolute top-2 right-2 text-lg transition-colors disabled:opacity-50 ${
                inWishlist ? 'text-orange-400' : 'text-gray-600 hover:text-orange-400'
              }`}
              title={inWishlist ? 'Von Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
              aria-label={inWishlist ? 'Von Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
            >
              🔖
            </button>
          </div>
        )
      })}
    </div>
  )
}
