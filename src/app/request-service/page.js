'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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

export default function RequestServicePage() {
  const searchParams = useSearchParams()
  const technicianId = searchParams.get('technician')

  const [form, setForm] = useState({
    category: '', description: '', city: '', address: '',
    contact_name: '', contact_phone: '', contact_email: '',
    preferred_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (technicianId) {
      // Αν έχουμε συγκεκριμένο τεχνικό → booking
      if (!user) {
        setError('Πρέπει να συνδεθείς για να κλείσεις ραντεβού.')
        setLoading(false)
        return
      }
      const { error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        technician_id: technicianId,
        category: form.category,
        description: form.description,
        address: form.address || form.city,
        city: form.city,
        scheduled_at: form.preferred_date || null,
        status: 'pending',
      })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      // Γενικό αίτημα → service_request
      const { error } = await supabase.from('service_requests').insert({
        customer_id: user?.id || null,
        category: form.category,
        description: form.description,
        city: form.city,
        preferred_date: form.preferred_date || null,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
      })
      if (error) { setError(error.message); setLoading(false); return }
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold mb-3">Το αίτημά σου στάλθηκε!</h2>
            <p className="text-gray-500 mb-8">Οι τεχνικοί θα επικοινωνήσουν μαζί σου σύντομα.</p>
            <a href="/technicians" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Δες τεχνικούς
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{technicianId ? 'Κλείσε Ραντεβού' : 'Ζήτηση Υπηρεσίας'}</h1>
        <p className="text-gray-500 mb-8">Συμπλήρωσε τα στοιχεία και θα επικοινωνήσουμε μαζί σου άμεσα.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Κατηγορία υπηρεσίας</label>
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Επίλεξε κατηγορία</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Πόλη</label>
            <input name="city" value={form.city} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="π.χ. Αθήνα" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση εργασίας</label>
            <input name="address" value={form.address} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="π.χ. Ερμού 10" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Περιγραφή προβλήματος</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Περίγραψε τι χρειάζεσαι..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Επιθυμητή ημερομηνία</label>
            <input name="preferred_date" type="datetime-local" value={form.preferred_date} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {!technicianId && (
            <>
              <hr className="border-gray-100" />
              <p className="text-sm font-medium text-gray-700">Στοιχεία επικοινωνίας</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο</label>
                  <input name="contact_name" value={form.contact_name} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Γιώργος Παπαδόπουλος" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο</label>
                  <input name="contact_phone" type="tel" value={form.contact_phone} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="69XXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="contact_email" type="email" value={form.contact_email} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@example.com" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 text-base">
            {loading ? 'Αποστολή...' : 'Αποστολή Αιτήματος'}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  )
}
