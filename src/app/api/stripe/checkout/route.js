import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })

  const { plan } = await request.json()
  if (!['pro', 'premium'].includes(plan)) {
    return NextResponse.json({ error: 'Μη έγκυρο πλάνο' }, { status: 400 })
  }

  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Το πλάνο δεν έχει ρυθμιστεί ακόμα' }, { status: 500 })
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'technician') {
    return NextResponse.json({ error: 'Μόνο τεχνικοί μπορούν να κάνουν αναβάθμιση' }, { status: 403 })
  }

  const { data: tech } = await supabase.from('technicians').select('*').eq('user_id', user.id).single()
  if (!tech) {
    return NextResponse.json({ error: 'Δεν βρέθηκε το προφίλ τεχνικού' }, { status: 404 })
  }

  const params = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://texnitesgr.vercel.app'}/dashboard?upgrade_success=${plan}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://texnitesgr.vercel.app'}/pricing?cancelled=true`,
  }

  if (tech.stripe_customer_id) {
    params.customer = tech.stripe_customer_id
    delete params.customer_email
  }

  try {
    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
