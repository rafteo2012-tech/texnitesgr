'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const categories = [
  { value: 'plumber', label: 'Υδραυλικός' },
  { value: 'electrician', label: 'Ηλεκτρολόγος' },
  { value: 'hvac', label: 'Ψυκτικός' },
  { value: 'locksmith', label: 'Κλειδαράς' },
  { value: 'cleaning', label: 'Καθαρισμός' },
  { value: 'gardener', label: 'Κηπουρός' },
  { value: 'painter', label: 'Ελαιοχρωματιστής' },
  { value: 'moving', label: 'Μετακομίσεις' },
  { value: 'appliance_repair', label: 'Τεχνικός Συσκευών' },
  { value: 'construction', label: 'Οικοδομικές Εργασίες' },
]

export default function RegisterTechnicianPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    business_name: '', bio: '', city: '', phone: '',
    categories: [], hourly_rate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleCategory = (val) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(val)
        ? f.categories.filter(c => c !== val)
        : [...f.categories, val]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Δημιουργία λογαριασμού
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: 'technician' } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Ενημέρωση profile με τηλέφωνο
    await supabase.from('profiles').update({ phone: form.phone }).eq('id', authData.user.id)

    // 3. Δημιουργία technician profile
    const { error: techError } = await supabase.from('technicians').insert({
      user_id: authData.user.id,
      business_name: form.business_name || form.full_name,
      bio: form.bio,
      city: form.city,
      categories: form.categories,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      is_active: true,
    })

    if (techError) {
      setError('Σφάλμα κατά την αποθήκευση προφίλ: ' + techError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">Καλώς ήρθες στο TexnitesGR!</h2>
          <p className="text-gray-500 text-sm mb-6">Επιβεβαίωσε το email σου και το προφίλ σου θα εμφανιστεί στην πλατφόρμα.</p>
          <Link href="/login" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Σύνδεση
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-blue-600">
            Texnites<span className="text-gray-900">GR</span>
          </Link>
          <h1 className="text-xl font-bold mt-4">Εγγραφή Τεχνικού</h1>
          <p className="text-gray-500 text-sm mt-1">Δημιούργησε το επαγγελματικό σου προφίλ</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              {s < 2 && <div className={`w-16 h-1 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Στοιχεία λογαριασμού</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Γιώργος Παπαδόπουλος" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Κωδικός</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Τουλάχιστον 6 χαρακτήρες" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="69XXXXXXXX" />
              </div>
              <button onClick={() => {
                if (!form.full_name || !form.email || !form.password || !form.phone) {
                  setError('Συμπλήρωσε όλα τα πεδία')
                  return
                }
                setError('')
                setStep(2)
              }} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Συνέχεια →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-bold text-lg">Επαγγελματικό Προφίλ</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Επωνυμία (προαιρετικό)</label>
                <input name="business_name" value={form.business_name} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. Παπαδόπουλος Υδραυλικοί" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Πόλη</label>
                <input name="city" value={form.city} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. Αθήνα, Θεσσαλονίκη" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ειδικότητες</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button type="button" key={cat.value} onClick={() => toggleCategory(cat.value)}
                      className={`text-sm px-3 py-2 rounded-lg border text-left transition-colors ${form.categories.includes(cat.value) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ωριαία χρέωση (€)</label>
                <input name="hourly_rate" type="number" value={form.hourly_rate} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Σύντομη περιγραφή</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Πες λίγα λόγια για την εμπειρία σου..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  ← Πίσω
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
                  {loading ? 'Αποθήκευση...' : 'Ολοκλήρωση'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Έχεις ήδη λογαριασμό;{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Σύνδεση</Link>
        </p>
      </div>
    </div>
  )
}
