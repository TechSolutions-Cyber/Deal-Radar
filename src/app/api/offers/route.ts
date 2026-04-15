/**
 * Proxy route for Marktguru API — keeps the API key server-side (HEL-3).
 * Response is cached for 5 minutes via Next.js cache + CDN headers.
 */

import { NextRequest, NextResponse } from 'next/server'

const MARKTGURU_API_URL = 'https://api.marktguru.de/api/v1'

export const runtime = 'edge'
export const revalidate = 300 // 5 minutes ISR cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const apiKey = process.env.MARKTGURU_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Build upstream query
  const upstreamParams = new URLSearchParams()
  const q = searchParams.get('q')
  if (q) upstreamParams.set('q', q)

  const supermarkets = searchParams.get('supermarkets')
  if (supermarkets) upstreamParams.set('supermarkets', supermarkets)

  const categories = searchParams.get('categories')
  if (categories) upstreamParams.set('categories', categories)

  const minPrice = searchParams.get('minPrice')
  if (minPrice) upstreamParams.set('minPrice', minPrice)

  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice) upstreamParams.set('maxPrice', maxPrice)

  const minDiscount = searchParams.get('minDiscount')
  if (minDiscount) upstreamParams.set('minDiscount', minDiscount)

  const sortBy = searchParams.get('sortBy')
  if (sortBy) upstreamParams.set('sortBy', sortBy)

  try {
    const upstreamUrl = `${MARKTGURU_API_URL}/offers?${upstreamParams.toString()}`
    const response = await fetch(upstreamUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
      // Next.js fetch cache — revalidates every 5 min
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Upstream API error', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Offers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
