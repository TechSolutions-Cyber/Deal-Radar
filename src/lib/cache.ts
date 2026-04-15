/**
 * Client-side API response cache using memory + localStorage.
 * TTL: 5 minutes for fresh data, 15 minutes stale-while-revalidate.
 */

const CACHE_TTL_MS = 5 * 60 * 1000       // 5 minutes: fresh
const CACHE_STALE_MS = 15 * 60 * 1000    // 15 minutes: stale-while-revalidate

interface CacheEntry<T> {
  data: T
  cachedAt: number
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

function getCacheKey(url: string, params?: Record<string, string>): string {
  if (!params) return url
  const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b))
  const qs = new URLSearchParams(sorted).toString()
  return qs ? `${url}?${qs}` : url
}

export function getCached<T>(key: string): { data: T; isStale: boolean } | null {
  // Check memory cache first (fastest)
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined
  if (memEntry) {
    const now = Date.now()
    if (now < memEntry.expiresAt + CACHE_STALE_MS) {
      return { data: memEntry.data, isStale: now > memEntry.expiresAt }
    }
    memoryCache.delete(key)
  }

  // Fall back to localStorage (survives page reload)
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`dr_cache_${key}`)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    const now = Date.now()
    if (now < entry.expiresAt + CACHE_STALE_MS) {
      // Warm memory cache
      memoryCache.set(key, entry as CacheEntry<unknown>)
      return { data: entry.data, isStale: now > entry.expiresAt }
    }
    localStorage.removeItem(`dr_cache_${key}`)
  } catch {
    // Ignore parse errors
  }
  return null
}

export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS,
  }
  memoryCache.set(key, entry as CacheEntry<unknown>)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`dr_cache_${key}`, JSON.stringify(entry))
    } catch {
      // Storage quota exceeded — skip persistence
    }
  }
}

/**
 * Fetches data with stale-while-revalidate caching.
 * Returns cached data immediately if available, then revalidates in background.
 */
export async function fetchWithCache<T>(
  url: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<T> {
  const key = getCacheKey(url, params)
  const cached = getCached<T>(key)

  const fullUrl = params
    ? `${url}?${new URLSearchParams(params).toString()}`
    : url

  if (cached) {
    if (cached.isStale) {
      // Revalidate in background, return stale data immediately
      fetch(fullUrl, options)
        .then((r) => r.json())
        .then((fresh) => setCache(key, fresh))
        .catch(() => { /* silent background refresh failure */ })
    }
    return cached.data
  }

  // No cache: fetch synchronously
  const response = await fetch(fullUrl, options)
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }
  const data: T = await response.json()
  setCache(key, data)
  return data
}

export { getCacheKey }
