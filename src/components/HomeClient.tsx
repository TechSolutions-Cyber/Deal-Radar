'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
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
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <Suspense fallback={<div className="skeleton h-14 rounded-xl" />}>
        <FilterBar />
      </Suspense>
      <Suspense>
        <DealGrid filters={defaultFilters} />
      </Suspense>
    </div>
  )
}
