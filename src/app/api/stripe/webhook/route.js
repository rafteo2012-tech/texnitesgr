import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event
  try {
    const text = await request.text()
    event = stripe.webhooks.constructEvent(text, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.user_id || session.client_reference_id
      const plan = session.metadata?.plan || 'pro'
      if (userId) {
        const customerId = session.customer
        const subscriptionId = session.subscription
        await supabase.from('technicians').update({
          subscription_plan: plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
        }).eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object
      const userId = subscription.metadata?.user_id
      const status = subscription.status
      if (userId) {
        const dbStatus = status === 'active' || status === 'trialing' ? 'active'
          : status === 'past_due' ? 'past_due'
          : status === 'canceled' ? 'cancelled'
          : 'inactive'
        await supabase.from('technicians').update({
          subscription_status: dbStatus,
          stripe_subscription_id: subscription.id,
        }).eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const userId = subscription.metadata?.user_id
      if (userId) {
        await supabase.from('technicians').update({
          subscription_plan: 'free',
          stripe_subscription_id: null,
          subscription_status: 'inactive',
        }).eq('user_id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
