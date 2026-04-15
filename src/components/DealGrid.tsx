'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Deal, FilterState } from '@/types/deal'
import { fetchDeals } from '@/lib/api'
import DealCard from './DealCard'

interface DealGridProps {
  initialDeals?: Deal[]
  filters: FilterState
}

const SKELETON_COUNT = 8

function DealSkeleton() {
  return (
    <div className="skeleton min-h-[280px] rounded-xl" aria-hidden />
  )
}

export default function DealGrid({ initialDeals, filters }: DealGridProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals ?? [])
  const [loading, setLoading] = useState(!initialDeals)
  const [wishlisted, setWishlisted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem('dr_wishlist')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const loadDeals = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDeals(filters)
      setDeals(data)
    } catch (err) {
      console.error('Failed to load deals:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadDeals()
  }, [loadDeals])

  const toggleWishlist = useCallback((deal: Deal) => {
    setWishlisted((prev) => {
      const next = new Set(prev)
      if (next.has(deal.id)) {
        next.delete(deal.id)
      } else {
        next.add(deal.id)
      }
      try {
        localStorage.setItem('dr_wishlist', JSON.stringify([...next]))
      } catch {
        // Storage quota
      }
      return next
    })
  }, [])

  if (loading) {
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        aria-busy="true"
        aria-label="Angebote werden geladen"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <DealSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-lg">Keine Angebote gefunden</p>
        <p className="text-sm mt-1">Filter anpassen oder später erneut versuchen</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {deals.map((deal, idx) => (
        <DealCard
          key={deal.id}
          deal={deal}
          // First 4 items are likely above the fold — mark as priority for LCP
          priority={idx < 4}
          onWishlist={toggleWishlist}
          isWishlisted={wishlisted.has(deal.id)}
        />
      ))}
    </div>
  )
}
