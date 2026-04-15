'use client'

import { useEffect } from 'react'

/**
 * Registers the Service Worker on mount.
 * Only runs in production (or when explicitly enabled) to avoid caching during dev.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for SW updates in the background
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — could show a toast here
              console.info('[SW] New version available, refresh to update.')
            }
          })
        })
      })
      .catch((err) => console.error('[SW] Registration failed:', err))
  }, [])
}
