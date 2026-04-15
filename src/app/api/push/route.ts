/**
 * Web Push Subscription Management
 * Handles registration and unregistration of push notification endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json()

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: 'Missing subscription or userId' },
        { status: 400 }
      )
    }

    // Validate subscription object structure
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      )
    }

    // Store push subscription in database
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: request.headers.get('user-agent') || undefined,
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to store subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Subscription saved successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Push subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint, userId } = await request.json()

    if (!endpoint || !userId) {
      return NextResponse.json(
        { error: 'Missing endpoint or userId' },
        { status: 400 }
      )
    }

    // Remove push subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Subscription removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
