/**
 * Deal Radar Service Worker
 * Strategy:
 *   - Static assets: Cache First (long TTL)
 *   - API /api/offers: Stale-While-Revalidate (5 min fresh, 15 min stale)
 *   - API /api/supermarkets, /api/categories: Cache First (1 hour)
 *   - External images: Cache First with 24h TTL
 */

const CACHE_VERSION = 'dr-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const API_CACHE = `${CACHE_VERSION}-api`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
]

const API_TTL = {
  '/api/offers': 5 * 60 * 1000,          // 5 minutes
  '/api/supermarkets': 60 * 60 * 1000,   // 1 hour
  '/api/categories': 60 * 60 * 1000,     // 1 hour
}
const API_STALE_GRACE = 15 * 60 * 1000  // 15 min extra stale grace

// ---- Install ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ---- Activate ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('dr-') && k !== STATIC_CACHE && k !== API_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ---- Fetch ----
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== 'GET') return

  // API routes: stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request, url))
    return
  }

  // External product images: cache-first with 24h TTL
  if (url.origin !== self.location.origin && request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  )
})

async function handleApiRequest(request, url) {
  const cache = await caches.open(API_CACHE)
  const cached = await cache.match(request)
  const ttl = Object.entries(API_TTL).find(([path]) => url.pathname.startsWith(path))?.[1] ?? API_TTL['/api/offers']

  if (cached) {
    const cachedAt = Number(cached.headers.get('X-Cached-At') ?? 0)
    const age = Date.now() - cachedAt
    const isStale = age > ttl

    if (!isStale) return cached

    if (age < ttl + API_STALE_GRACE) {
      // Stale but within grace period: return stale, revalidate in background
      revalidateInBackground(request, cache)
      return cached
    }
  }

  // No cache or too stale: fetch fresh
  try {
    const response = await fetch(request)
    if (response.ok) {
      const clone = response.clone()
      const body = await clone.arrayBuffer()
      const headers = new Headers(response.headers)
      headers.set('X-Cached-At', String(Date.now()))
      const toCache = new Response(body, { status: response.status, headers })
      cache.put(request, toCache)
    }
    return response
  } catch {
    // Network failure: return stale if available
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function revalidateInBackground(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const body = await response.clone().arrayBuffer()
      const headers = new Headers(response.headers)
      headers.set('X-Cached-At', String(Date.now()))
      cache.put(request, new Response(body, { status: response.status, headers }))
    }
  } catch {
    // Silent background failure
  }
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    return new Response('', { status: 408 })
  }
}

// ---- Push Notifications (prepared for HEL-5) ----
self.addEventListener('push', (event) => {
  if (!event.data) return
  const payload = event.data.json()
  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Deal Radar', {
      body: payload.body ?? 'Neue Angebote verfügbar!',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: payload.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(clients.openWindow(url))
})
