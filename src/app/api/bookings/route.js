import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })

  const body = await request.json()
  const { technician_id, category, description, address, city, scheduled_at } = body

  const { data, error } = await supabase
    .from('bookings')
    .insert({ customer_id: user.id, technician_id, category, description, address, city, scheduled_at: scheduled_at || null, status: 'pending' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })

  const { data, error } = await supabase
    .from('bookings')
    .select('*, technicians(business_name, city, profiles(full_name, avatar_url))')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
