import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const technicianId = searchParams.get('technician_id')

  if (!technicianId) {
    return NextResponse.json({ error: 'technician_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })

  const body = await request.json()
  const { booking_id, technician_id, rating, comment } = body

  if (!booking_id || !technician_id || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ booking_id, customer_id: user.id, technician_id, rating, comment })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}