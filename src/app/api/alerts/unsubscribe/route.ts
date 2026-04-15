/**
 * Email Unsubscribe Handler
 * Processes one-click unsubscribe links from email notifications
 * GET: Validates token and disables email alerts
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
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      )
    }

    // Find and validate unsubscribe token
    const { data: tokenData, error: tokenError } = await supabase
      .from('unsubscribe_tokens')
      .select('user_id, used, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Unsubscribe token has expired' },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (tokenData.used) {
      return NextResponse.json(
        { error: 'This unsubscribe link has already been used' },
        { status: 400 }
      )
    }

    // Mark token as used
    await supabase
      .from('unsubscribe_tokens')
      .update({ used: true })
      .eq('token', token)

    // Disable email alerts for this user
    await supabase
      .from('alert_preferences')
      .update({ email_enabled: false, updated_at: new Date().toISOString() })
      .eq('user_id', tokenData.user_id)

    // Redirect to success page with message
    return NextResponse.redirect(
      `${request.nextUrl.origin}/unsubscribed?status=success`,
      { status: 303 }
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
