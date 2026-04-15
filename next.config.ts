import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Performance: Enable React compiler optimizations
  experimental: {
    optimizePackageImports: ['clsx'],
  },

  // Image optimization: automatic WebP/AVIF conversion, lazy loading
  images: {
    formats: ['image/avif', 'image/webp'],
    // External image domains for deal product images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.marktguru.de',
      },
      {
        protocol: 'https',
        hostname: '**.lidl.de',
      },
      {
        protocol: 'https',
        hostname: '**.aldi.de',
      },
      {
        protocol: 'https',
        hostname: '**.rewe.de',
      },
      {
        protocol: 'https',
        hostname: '**.edeka.de',
      },
      {
        protocol: 'https',
        hostname: '**.penny.de',
      },
    ],
    // Cache images for 60 seconds minimum (ISR-compatible)
    minimumCacheTTL: 60,
    // Prevent layout shifts by enforcing dimensions
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance: compress responses
  compress: true,

  // Performance: generate production source maps only when needed
  productionBrowserSourceMaps: false,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ]
  },
}

export default nextConfig
