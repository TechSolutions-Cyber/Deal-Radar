import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  title: 'Deal Radar – Supermarkt Angebote',
  description: 'Die besten Angebote aus Lidl, Aldi, Rewe, Edeka, Penny und mehr – täglich aktuell.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Deal Radar',
  },
  openGraph: {
    title: 'Deal Radar',
    description: 'Supermarkt-Angebote täglich aktuell',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f97316',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* Preconnect to image CDNs to reduce LCP latency */}
        <link rel="preconnect" href="https://api.marktguru.de" />
        <link rel="dns-prefetch" href="https://api.marktguru.de" />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
