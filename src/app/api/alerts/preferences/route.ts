/**
 * Alert Preferences Management
 * GET: Retrieve user alert preferences
 * PUT: Update user alert preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Bearer token or query parameter
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId && !token) {
      return NextResponse.json(
        { error: 'Missing userId or authentication' },
        { status: 400 }
      )
    }

    // Fetch alert preferences
    const { data, error } = await supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    // Return default preferences if none exist
    if (!data) {
      return NextResponse.json({
        user_id: userId,
        supermarket_ids: [],
        category_ids: [],
        frequency: 'daily',
        email_enabled: true,
        push_enabled: true,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Alert preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, supermarket_ids, category_ids, frequency, email_enabled, push_enabled } =
      await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Validate frequency
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be "daily" or "weekly"' },
        { status: 400 }
      )
    }

    // Update or create alert preferences
    const { data, error } = await supabase
      .from('alert_preferences')
      .upsert({
        user_id: userId,
        supermarket_ids: supermarket_ids || [],
        category_ids: category_ids || [],
        frequency: frequency || 'daily',
        email_enabled: email_enabled !== undefined ? email_enabled : true,
        push_enabled: push_enabled !== undefined ? push_enabled : true,
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 200 })
  } catch (error) {
    console.error('Alert preferences update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
