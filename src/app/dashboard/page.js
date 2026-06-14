'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const statusLabel = {
  pending: { label: 'Αναμονή', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Επιβεβαιωμένο', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Ολοκληρώθηκε', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Ακυρώθηκε', color: 'bg-red-100 text-red-700' },
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [techProfile, setTechProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)

      if (profile?.role === 'technician') {
        const { data: tech } = await supabase.from('technicians').select('*').eq('user_id', user.id).single()
        setTechProfile(tech)

        // Bookings ως τεχνικός
        const { data: bk } = await supabase
          .from('bookings')
          .select('*, profiles!bookings_customer_id_fkey(full_name, phone)')
          .eq('technician_id', tech?.id)
          .order('created_at', { ascending: false })
        setBookings(bk || [])
      } else {
        // Bookings ως πελάτης
        const { data: bk } = await supabase
          .from('bookings')
          .select('*, technicians(business_name, city, profiles(full_name))')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
        setBookings(bk || [])
      }

      setLoading(false)
    }
    load()
  }, [])

  const updateBookingStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-gray-400">Φόρτωση...</div>
        </div>
      </main>
    )
  }

  const isTechnician = profile?.role === 'technician'

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold">Καλώς ήρθες, {profile?.full_name}!</h1>
            <p className="text-sm text-gray-500">{isTechnician ? '👷 Τεχνικός' : '👤 Πελάτης'} · {user?.email}</p>
          </div>
          {isTechnician && techProfile && (
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">Πλάνο</div>
              <div className="font-semibold capitalize text-blue-600">{techProfile.subscription_plan}</div>
            </div>
          )}
        </div>

        {/* Technician stats */}
        {isTechnician && techProfile && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Αξιολόγηση', value: techProfile.avg_rating > 0 ? `${techProfile.avg_rating}⭐` : 'Καμία' },
              { label: 'Κρατήσεις', value: bookings.length },
              { label: 'Κατάσταση', value: techProfile.is_active ? '🟢 Ενεργό' : '🔴 Ανενεργό' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{isTechnician ? 'Εισερχόμενα Αιτήματα' : 'Οι Κρατήσεις μου'}</h2>
            {!isTechnician && (
              <Link href="/technicians" className="text-sm text-blue-600 font-semibold hover:underline">+ Νέα κράτηση</Link>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">
                {isTechnician ? 'Δεν υπάρχουν αιτήματα ακόμα.' : 'Δεν έχεις κρατήσεις ακόμα.'}
              </p>
              {!isTechnician && (
                <Link href="/technicians" className="mt-4 inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Βρες Τεχνικό
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-sm">
                        {isTechnician
                          ? `Πελάτης: ${b.profiles?.full_name || 'Άγνωστος'}`
                          : `Τεχνικός: ${b.technicians?.business_name || b.technicians?.profiles?.full_name || 'Άγνωστος'}`
                        }
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{b.description}</div>
                      <div className="text-xs text-gray-400 mt-1">📍 {b.city} · {new Date(b.created_at).toLocaleDateString('el-GR')}</div>
                      {b.scheduled_at && (
                        <div className="text-xs text-blue-600 mt-1">📅 {new Date(b.scheduled_at).toLocaleString('el-GR')}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusLabel[b.status]?.color}`}>
                        {statusLabel[b.status]?.label}
                      </span>
                      {isTechnician && b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                            Αποδοχή
                          </button>
                          <button onClick={() => updateBookingStatus(b.id, 'cancelled')}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                            Απόρριψη
                          </button>
                        </div>
                      )}
                      {isTechnician && b.status === 'confirmed' && (
                        <button onClick={() => updateBookingStatus(b.id, 'completed')}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                          Ολοκλήρωση
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
