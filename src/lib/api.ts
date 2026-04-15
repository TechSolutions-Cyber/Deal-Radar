/**
 * API client — all calls go through /api/* proxy routes (never directly to Marktguru).
 * This protects the API key (HEL-3) and allows server-side caching.
 */

import { fetchWithCache } from './cache'
import type { Deal, FilterState } from '@/types/deal'

export async function fetchDeals(filters?: Partial<FilterState>): Promise<Deal[]> {
  const params: Record<string, string> = {}

  if (filters?.query) params.q = filters.query
  if (filters?.supermarkets?.length) params.supermarkets = filters.supermarkets.join(',')
  if (filters?.categories?.length) params.categories = filters.categories.join(',')
  if (filters?.minPrice != null) params.minPrice = String(filters.minPrice)
  if (filters?.maxPrice != null) params.maxPrice = String(filters.maxPrice)
  if (filters?.minDiscount != null) params.minDiscount = String(filters.minDiscount)
  if (filters?.sortBy) params.sortBy = filters.sortBy

  return fetchWithCache<Deal[]>('/api/offers', params)
}

export async function fetchSupermarkets(): Promise<string[]> {
  return fetchWithCache<string[]>('/api/supermarkets')
}

export async function fetchCategories(): Promise<string[]> {
  return fetchWithCache<string[]>('/api/categories')
}
