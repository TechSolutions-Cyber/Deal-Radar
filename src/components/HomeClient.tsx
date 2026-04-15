'use client'

import dynamic from 'next/dynamic'
import { Suspense, useCallback, useState } from 'react'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import type { FilterState } from '@/types/deal'

const DealGrid = dynamic(() => import('@/components/DealGrid'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton min-h-[280px] rounded-xl" />
      ))}
    </div>
  ),
})

const FilterBar = dynamic(() => import('@/components/FilterBar'), {
  ssr: false,
  loading: () => <div className="skeleton h-14 rounded-xl w-full" />,
})

const defaultFilters: FilterState = {
  supermarkets: [],
  categories: [],
  sortBy: 'relevance',
  query: '',
}

export default function HomeClient() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(async () => {
    // Invalidate SW cache for API routes so fresh data loads
    if ('caches' in window) {
      const cache = await caches.open('dr-v1-api')
      await cache.keys().then((keys) => Promise.all(keys.map((k) => cache.delete(k))))
    }
    setRefreshKey((k) => k + 1)
  }, [])

  const { pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh })

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-20 sm:pb-4">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center text-orange-400 text-sm gap-2 overflow-hidden transition-all"
          style={{ height: Math.min(pullDistance, 48) }}
        >
          <span className={isRefreshing ? 'animate-spin' : ''} style={{ transform: `rotate(${pullDistance * 3}deg)` }}>
            ↻
          </span>
          <span>{isRefreshing ? 'Aktualisieren…' : 'Loslassen zum Aktualisieren'}</span>
        </div>
      )}

      <Suspense fallback={<div className="skeleton h-14 rounded-xl" />}>
        <FilterBar />
      </Suspense>
      <Suspense>
        <DealGrid key={refreshKey} filters={defaultFilters} />
      </Suspense>
    </div>
  )
}
