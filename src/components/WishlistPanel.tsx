'use client'

import { useTransition } from 'react'
import { removeFromWishlist } from '@/app/dashboard/actions'
import type { Deal } from '@/types/deal'

interface WishlistPanelProps {
  items: (Deal & { _savedAt?: string })[]
}

export default function WishlistPanel({ items }: WishlistPanelProps) {
  const [isPending, startTransition] = useTransition()

  if (items.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Merkliste</h2>
        <div className="bg-[#2a2a3e] rounded-xl p-8 text-center border border-white/5">
          <span className="text-4xl block mb-3">🔖</span>
          <p className="text-gray-400 text-sm">Noch keine Deals gemerkt.</p>
          <p className="text-gray-500 text-xs mt-1">
            Tippe auf das Lesezeichen-Symbol bei einem Deal, um ihn zu speichern.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">
        Merkliste <span className="text-sm font-normal text-gray-400">({items.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((deal) => (
          <div
            key={deal.id}
            className="bg-[#2a2a3e] rounded-xl p-4 border border-white/5 flex gap-3 items-start"
          >
            {deal.imageUrl && (
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-16 h-16 object-contain rounded-lg bg-white/5 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium line-clamp-2 leading-snug">{deal.title}</p>
              <div className="flex items-center gap-2 mt-1">
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
              onClick={() => startTransition(() => removeFromWishlist(deal.id))}
              className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50"
              title="Von Merkliste entfernen"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
