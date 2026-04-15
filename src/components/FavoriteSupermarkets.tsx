'use client'

import { useTransition } from 'react'
import { toggleFavorite } from '@/app/dashboard/actions'

const SUPERMARKETS = ['Lidl', 'Aldi', 'Rewe', 'Edeka', 'Penny', 'Kaufland', 'Netto', 'Norma']

interface FavoriteSupermarketsProps {
  favorites: string[]
}

export default function FavoriteSupermarkets({ favorites }: FavoriteSupermarketsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">Lieblings-Supermärkte</h2>
      <div className="flex flex-wrap gap-2">
        {SUPERMARKETS.map((market) => {
          const isActive = favorites.includes(market)
          return (
            <button
              key={market}
              disabled={isPending}
              onClick={() => startTransition(() => toggleFavorite(market))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-transparent border-white/15 text-gray-400 hover:border-white/30 hover:text-white'
              } disabled:opacity-50`}
            >
              {market}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Gewählte Supermärkte werden im Feed priorisiert angezeigt.
      </p>
    </section>
  )
}
