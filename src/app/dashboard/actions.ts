'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Deal } from '@/types/deal'

export async function toggleFavorite(supermarket: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('supermarket', supermarket)
    .single()

  if (existing) {
    await supabase.from('user_favorites').delete().eq('id', existing.id)
  } else {
    await supabase.from('user_favorites').insert({ user_id: user.id, supermarket })
  }

  revalidatePath('/dashboard')
}

export async function addToWishlist(deal: Deal) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  const { error } = await supabase.from('user_wishlist').upsert(
    { user_id: user.id, deal_id: deal.id, deal_data: deal },
    { onConflict: 'user_id,deal_id' }
  )

  revalidatePath('/dashboard')
  return { error: error?.message }
}

export async function removeFromWishlist(dealId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('user_wishlist')
    .delete()
    .eq('user_id', user.id)
    .eq('deal_id', dealId)

  revalidatePath('/dashboard')
}

export async function getFavoritesAndWishlist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { favorites: [], wishlist: [] }

  const [{ data: favorites }, { data: wishlist }] = await Promise.all([
    supabase.from('user_favorites').select('supermarket').eq('user_id', user.id).order('created_at'),
    supabase.from('user_wishlist').select('deal_id, deal_data, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return {
    favorites: (favorites ?? []).map((f) => f.supermarket as string),
    wishlist: (wishlist ?? []).map((w) => ({ ...(w.deal_data as Deal), _savedAt: w.created_at })),
  }
}
