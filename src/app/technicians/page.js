'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const categories = [
  { value: '', label: 'Όλες οι κατηγορίες' },
  { value: 'plumber', label: 'Υδραυλικοί' },
  { value: 'electrician', label: 'Ηλεκτρολόγοι' },
  { value: 'hvac', label: 'Ψυκτικοί' },
  { value: 'locksmith', label: 'Κλειδαράδες' },
  { value: 'cleaning', label: 'Καθαρισμοί' },
  { value: 'gardener', label: 'Κηπουροί' },
  { value: 'painter', label: 'Ελαιοχρωματιστές' },
  { value: 'moving', label: 'Μετακομίσεις' },
  { value: 'appliance_repair', label: 'Τεχνικοί Συσκευών' },
  { value: 'construction', label: 'Οικοδομικές' },
]

export default function TechniciansPage() {
  const searchParams = useSearchParams()
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const supabase = createClient()

  const fetchTechnicians = async () => {
    setLoading(true)
    let query = supabase
      .from('technicians')
      .select(`id, business_name, bio, categories, city, hourly_rate, avg_rating, total_reviews, is_verified, is_featured, photos, profiles(full_name, avatar_url, phone)`)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('avg_rating', { ascending: false })

    if (city)     query = query.ilike('city', `%${city}%`)
    if (category) query = query.contains('categories', [category])

    const { data } = await query
    setTechnicians(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTechnicians() }, [city, category])

  const categoryLabel = (val) => categories.find(c => c.value === val)?.label || val

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Βρες Τεχνικό</h1>
        <p className="text-gray-500 mb-8">Επίλεξε κατηγορία και πόλη για να βρεις τον κατάλληλο επαγγελματία</p>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input value={city} onChange={e => setCity(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Πόλη (π.χ. Αθήνα)" />
          <button onClick={fetchTechnicians}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Αναζήτηση
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Δεν βρέθηκαν τεχνικοί</h3>
            <p className="text-gray-500 text-sm">Δοκίμασε διαφορετική πόλη ή κατηγορία</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{technicians.length} τεχνικοί βρέθηκαν</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technicians.map(tech => (
                <div key={tech.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  {tech.is_featured && (
                    <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block mb-3">⭐ Featured</div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                      {tech.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {tech.business_name || tech.profiles?.full_name}
                        {tech.is_verified && <span className="ml-1 text-blue-500 text-xs">✓</span>}
                      </h3>
                      <p className="text-sm text-gray-500">📍 {tech.city}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(tech.categories || []).map(cat => (
                      <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{categoryLabel(cat)}</span>
                    ))}
                  </div>

                  {tech.bio && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tech.bio}</p>}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-semibold text-sm">{tech.avg_rating > 0 ? tech.avg_rating : 'Νέος'}</span>
                      {tech.total_reviews > 0 && <span className="text-gray-400 text-xs">({tech.total_reviews})</span>}
                    </div>
                    {tech.hourly_rate && (
                      <span className="text-sm font-semibold text-gray-700">{tech.hourly_rate}€/ώρα</span>
                    )}
                  </div>

                  <Link href={`/request-service?technician=${tech.id}`}
                    className="block w-full text-center bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                    Κλείσε Ραντεβού
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
