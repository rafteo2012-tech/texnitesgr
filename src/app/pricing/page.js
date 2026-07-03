'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { PLANS } from '@/lib/plans'

export default function PricingPage() {
  const [loading, setLoading] = useState(null)

  const checkout = async (plan) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Επέλεξε το Πλάνο σου</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Αύξησε την προβολή σου και ξεχώρισε στους πελάτες με τα επαγγελματικά πακέτα του TexnitesGR.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(PLANS).map(plan => (
            <div key={plan.key} className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-100'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  ΔΗΜΟΦΙΛΕΣ
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold">{plan.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>
              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold">Δωρεάν</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">{plan.priceLabel}</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.key === 'free' ? (
                <Link href="/register-technician"
                  className="block text-center border border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Ξεκίνα Δωρεάν
                </Link>
              ) : (
                <button onClick={() => checkout(plan.key)} disabled={loading === plan.key}
                  className={`w-full text-center font-semibold text-sm py-3 rounded-xl transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-blue-600 text-blue-600 hover:bg-blue-50'} disabled:opacity-60`}>
                  {loading === plan.key ? 'Ανακατεύθυνση...' : 'Αναβάθμισε'}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Η πληρωμή γίνεται μέσω Stripe. Ακύρωση οποιαδήποτε στιγμή.
        </p>
      </div>
      <Footer />
    </main>
  )
}
