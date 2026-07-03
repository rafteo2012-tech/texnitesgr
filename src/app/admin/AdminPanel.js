'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('technicians')
  const [technicians, setTechnicians] = useState([])
  const [requests, setRequests] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const supabaseRef = useRef(null)

  useEffect(() => {
    supabaseRef.current = createClient()
    const supabase = supabaseRef.current
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)

      if (profile?.role !== 'admin') {
        setAuthorized(false)
        setLoading(false)
        return
      }

      setAuthorized(true)
      await loadTabData('technicians')
      setLoading(false)
    }
    load()
  }, [])

  const db = () => supabaseRef.current
  const loadTabData = async (t) => {
    if (t === 'technicians') {
      const { data } = await db().from('technicians').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false })
      setTechnicians(data || [])
    } else if (t === 'requests') {
      const { data } = await db().from('service_requests').select('*').order('created_at', { ascending: false })
      setRequests(data || [])
    } else if (t === 'bookings') {
      const { data } = await db().from('bookings').select('*, profiles(full_name), technicians(business_name, profiles(full_name))').order('created_at', { ascending: false })
      setBookings(data || [])
    }
  }

  const toggleTechnicianStatus = async (id, current) => {
    await db().from('technicians').update({ is_active: !current }).eq('id', id)
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, is_active: !current } : t))
  }

  const toggleVerified = async (id, current) => {
    await db().from('technicians').update({ is_verified: !current }).eq('id', id)
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, is_verified: !current } : t))
  }

  const toggleFeatured = async (id, current) => {
    await db().from('technicians').update({ is_featured: !current }).eq('id', id)
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, is_featured: !current } : t))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-gray-400">Φόρτωση...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">Πρόσβαση μόνο για Admin</h2>
            <p className="text-gray-500 text-sm">Δεν έχεις δικαιώματα διαχειριστή.</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const tabs = [
    { key: 'technicians', label: 'Τεχνικοί' },
    { key: 'requests', label: 'Αιτήματα' },
    { key: 'bookings', label: 'Κρατήσεις' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-500">Διαχείριση πλατφόρμας TexnitesGR</p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Πίσω στο Dashboard</Link>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); loadTabData(t.key) }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'technicians' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Επωνυμία</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Πόλη</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Πλάνο</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Επαλήθευση</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Featured</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Ενεργός</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {technicians.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{t.business_name || t.profiles?.full_name}</td>
                      <td className="px-4 py-3 text-gray-500">{t.profiles?.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{t.city}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${t.subscription_plan === 'premium' ? 'bg-purple-100 text-purple-700' : t.subscription_plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {t.subscription_plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleVerified(t.id, t.is_verified)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${t.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50'}`}>
                          {t.is_verified ? 'Verified' : 'Mark'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleFeatured(t.id, t.is_featured)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${t.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-amber-50'}`}>
                          {t.is_featured ? 'Featured' : 'Mark'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleTechnicianStatus(t.id, t.is_active)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.is_active ? 'Ενεργός' : 'Ανενεργός'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {technicians.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Δεν υπάρχουν τεχνικοί</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Δεν υπάρχουν αιτήματα</div>
            ) : (
              requests.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-sm">{r.contact_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.contact_phone} · {r.contact_email || '-'}</div>
                      <div className="text-sm text-gray-600 mt-2">{r.description}</div>
                      <div className="flex gap-3 text-xs text-gray-400 mt-2">
                        <span>{r.category}</span>
                        <span>{r.city}</span>
                        <span>{new Date(r.created_at).toLocaleDateString('el-GR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Δεν υπάρχουν κρατήσεις</div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {b.profiles?.full_name} → {b.technicians?.business_name || b.technicians?.profiles?.full_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{b.description}</div>
                      <div className="flex gap-3 text-xs text-gray-400 mt-1">
                        <span>{b.city}</span>
                        <span>{new Date(b.created_at).toLocaleDateString('el-GR')}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${b.status === 'completed' ? 'bg-green-100 text-green-700' : b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
