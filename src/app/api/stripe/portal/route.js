import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })

  const { data: tech } = await supabase.from('technicians').select('stripe_customer_id').eq('user_id', user.id).single()
  if (!tech?.stripe_customer_id) {
    return NextResponse.json({ error: 'Δεν βρέθηκε συνδρομή' }, { status: 404 })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: tech.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://texnitesgr.vercel.app'}/dashboard`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
