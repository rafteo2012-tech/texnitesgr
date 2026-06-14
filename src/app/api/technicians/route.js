import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const city     = searchParams.get('city')
  const category = searchParams.get('category')
  const limit    = parseInt(searchParams.get('limit') || '20')
  const page     = parseInt(searchParams.get('page') || '0')

  let query = supabase
    .from('technicians')
    .select(`id, business_name, bio, categories, city, hourly_rate, avg_rating,
             total_reviews, is_verified, is_featured, photos, subscription_plan,
             profiles(full_name, avatar_url, phone)`)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('avg_rating', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (city)     query = query.ilike('city', `%${city}%`)
  if (category) query = query.contains('categories', [category])

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count: data.length })
}
