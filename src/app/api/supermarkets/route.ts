import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 3600 // 1 hour — supermarkets don't change often

const MARKTGURU_API_URL = 'https://api.marktguru.de/api/v1'

export async function GET() {
  const apiKey = process.env.MARKTGURU_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`${MARKTGURU_API_URL}/supermarkets`, {
      headers: { 'X-Api-Key': apiKey, 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await response.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error) {
    console.error('Supermarkets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
