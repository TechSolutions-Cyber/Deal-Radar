/**
 * Backend proxy for Marktguru API /offers/search endpoint.
 * Keeps API keys server-side and accepts q (search term) and zipCode parameters.
 * Implements caching for 5 minutes via Next.js cache.
 */

import { NextRequest, NextResponse } from 'next/server'

const MARKTGURU_API_URL = 'https://api.marktguru.de/api/v1'

export const runtime = 'edge'
export const revalidate = 300 // 5 minutes ISR cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const apiKey = process.env.MARKTGURU_API_KEY
  const clientKey = process.env.MARKTGURU_CLIENT_KEY

  if (!apiKey || !clientKey) {
    return NextResponse.json(
      { error: 'API credentials not configured' },
      { status: 500 }
    )
  }

  // Extract query parameters
  const q = searchParams.get('q')
  const zipCode = searchParams.get('zipCode')

  // Build upstream query parameters
  const upstreamParams = new URLSearchParams()
  if (q) upstreamParams.set('q', q)
  if (zipCode) upstreamParams.set('zipCode', zipCode)

  try {
    const upstreamUrl = `${MARKTGURU_API_URL}/offers/search?${upstreamParams.toString()}`

    const response = await fetch(upstreamUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'X-Client-Key': clientKey,
        'Accept': 'application/json',
      },
      // Next.js fetch cache — revalidates every 5 minutes
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
    console.error('Deals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
