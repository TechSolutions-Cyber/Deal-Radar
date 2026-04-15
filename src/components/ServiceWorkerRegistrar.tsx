'use client'

import { useServiceWorker } from '@/hooks/useServiceWorker'

/**
 * Thin client component that registers the Service Worker.
 * Extracted so layout.tsx stays a Server Component.
 */
export default function ServiceWorkerRegistrar() {
  useServiceWorker()
  return null
}
