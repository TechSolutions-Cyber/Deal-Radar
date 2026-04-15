'use client'

/**
 * FilterBar — basic search + sort for the main page.
 * Advanced multi-select filters live in HEL-6.
 */

import { useState, useTransition, useCallback } from 'react'

interface FilterBarProps {
  onFilterChange?: (query: string, sortBy: string) => void
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [, startTransition] = useTransition()

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      startTransition(() => {
        onFilterChange?.(value, sortBy)
      })
    },
    [sortBy, onFilterChange]
  )

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setSortBy(value)
      startTransition(() => {
        onFilterChange?.(query, value)
      })
    },
    [query, onFilterChange]
  )

  return (
    <div className="flex gap-2 items-center bg-[#2a2a3e] rounded-xl px-3 py-2.5">
      <span className="text-gray-400 flex-shrink-0" aria-hidden>🔍</span>
      <input
        type="search"
        value={query}
        onChange={handleQueryChange}
        placeholder="Angebote suchen…"
        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
        aria-label="Angebote suchen"
      />
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="bg-transparent text-gray-400 text-xs outline-none cursor-pointer"
        aria-label="Sortierung"
      >
        <option value="relevance">Relevanz</option>
        <option value="discount">Rabatt</option>
        <option value="price">Preis ↑</option>
        <option value="newest">Neu</option>
      </select>
    </div>
  )
}
