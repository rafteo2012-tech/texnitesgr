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
  const [reviews, setReviews] = useState({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
      if (!profile) { setLoading(false); return }

      if (profile.role === 'technician') {
        const { data: tech } = await supabase.from('technicians').select('*').eq('user_id', user.id).single()
        setTechProfile(tech)

        if (tech) {
          const { data: bk } = await supabase
            .from('bookings')
            .select('*, profiles!bookings_customer_id_fkey(full_name, phone)')
            .eq('technician_id', tech.id)
            .order('created_at', { ascending: false })
          setBookings(bk || [])
        }
      } else {
        const { data: bk } = await supabase
          .from('bookings')
          .select('*, technicians(business_name, city, hourly_rate, profiles(full_name))')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
        setBookings(bk || [])

        // Load existing reviews by customer
        const { data: existingReviews } = await supabase
          .from('reviews')
          .select('booking_id, rating, comment')
          .eq('customer_id', user.id)
        if (existingReviews) {
          const map = {}
          existingReviews.forEach(r => { map[r.booking_id] = r })
          setReviews(map)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  const updateBookingStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const submitReview = async (bookingId, technicianId, rating, comment) => {
    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      customer_id: user.id,
      technician_id: technicianId,
      rating,
      comment,
    })
    if (!error) {
      setReviews(prev => ({ ...prev, [bookingId]: { rating, comment } }))
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-gray-400">Φόρτωση...</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Δεν βρέθηκε προφίλ</h2>
            <p className="text-gray-500 text-sm mb-6">Συμπλήρωσε τα στοιχεία σου για να συνεχίσεις.</p>
            <Link href="/register-technician" className="text-blue-600 font-semibold hover:underline">Συμπλήρωσε προφίλ</Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const isTechnician = profile.role === 'technician'

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
            {profile.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold">Καλώς ήρθες, {profile.full_name}!</h1>
            <p className="text-sm text-gray-500">{isTechnician ? 'Τεχνικός' : 'Πελάτης'} · {user?.email}</p>
          </div>
          {isTechnician && techProfile && (
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">Πλάνο</div>
              <div className="font-semibold capitalize text-blue-600">{techProfile.subscription_plan || 'free'}</div>
            </div>
          )}
          {profile.role === 'admin' && (
            <div className="ml-auto">
              <Link href="/admin" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Admin
              </Link>
            </div>
          )}
        </div>

        {/* Technician stats */}
        {isTechnician && techProfile && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Αξιολόγηση', value: techProfile.avg_rating > 0 ? `${techProfile.avg_rating} ⭐` : 'Καμία' },
              { label: 'Κρατήσεις', value: bookings.length },
              { label: 'Κατάσταση', value: techProfile.is_active ? 'Ενεργό' : 'Ανενεργό' },
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
                <BookingCard
                  key={b.id}
                  booking={b}
                  isTechnician={isTechnician}
                  techProfile={techProfile}
                  existingReview={reviews[b.id]}
                  onSubmitReview={(rating, comment) => submitReview(b.id, b.technician_id, rating, comment)}
                  onStatusChange={updateBookingStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

function BookingCard({ booking: b, isTechnician, existingReview, onSubmitReview, onStatusChange }) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    setSubmitting(true)
    await onSubmitReview(reviewRating, reviewComment)
    setSubmitting(false)
    setShowReviewForm(false)
  }

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm">
            {isTechnician
              ? `Πελάτης: ${b.profiles?.full_name || 'Άγνωστος'}`
              : `Τεχνικός: ${b.technicians?.business_name || b.technicians?.profiles?.full_name || 'Άγνωστος'}`
            }
          </div>
          <div className="text-sm text-gray-500 mt-1">{b.description}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
            <span>{b.city}</span>
            <span>{new Date(b.created_at).toLocaleDateString('el-GR')}</span>
            {b.scheduled_at && (
              <span className="text-blue-600">{new Date(b.scheduled_at).toLocaleString('el-GR')}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusLabel[b.status]?.color}`}>
            {statusLabel[b.status]?.label}
          </span>
          {isTechnician && b.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onStatusChange(b.id, 'confirmed')}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                Αποδοχή
              </button>
              <button onClick={() => onStatusChange(b.id, 'cancelled')}
                className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                Απόρριψη
              </button>
            </div>
          )}
          {isTechnician && b.status === 'confirmed' && (
            <button onClick={() => onStatusChange(b.id, 'completed')}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              Ολοκλήρωση
            </button>
          )}
          {!isTechnician && b.status === 'completed' && !existingReview && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors">
              Αξιολόγησε
            </button>
          )}
          {!isTechnician && existingReview && (
            <span className="text-xs text-green-600 font-medium">Αξιολογήθηκε {existingReview.rating}/5</span>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold mb-2">Αξιολόγησε τον τεχνικό</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setReviewRating(n)}
                className={`text-xl ${n <= reviewRating ? 'text-amber-400' : 'text-gray-300'} hover:text-amber-400 transition-colors`}>
                ★
              </button>
            ))}
          </div>
          <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="Γράψε ένα σχόλιο (προαιρετικό)" rows={2} />
          <div className="flex gap-2">
            <button onClick={handleSubmitReview} disabled={submitting}
              className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
              {submitting ? 'Αποστολή...' : 'Υποβολή'}
            </button>
            <button onClick={() => setShowReviewForm(false)}
              className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Ακύρωση
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
