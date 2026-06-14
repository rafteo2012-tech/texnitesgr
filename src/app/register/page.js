'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: 'customer' }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-bold mb-2">Έλεγξε το email σου!</h2>
          <p className="text-gray-500 text-sm">Στείλαμε σύνδεσμο επιβεβαίωσης στο <strong>{form.email}</strong>. Κάνε κλικ για να ενεργοποιήσεις τον λογαριασμό σου.</p>
          <Link href="/login" className="mt-6 inline-block text-blue-600 font-semibold hover:underline text-sm">Πήγαινε στη σύνδεση</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-blue-600">
            Texnites<span className="text-gray-900">GR</span>
          </Link>
          <h1 className="text-xl font-bold mt-4 text-gray-900">Δημιουργία λογαριασμού</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο</label>
            <input name="full_name" type="text" value={form.full_name} onChange={handleChange} required
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
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading ? 'Εγγραφή...' : 'Δημιουργία λογαριασμού'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Έχεις ήδη λογαριασμό;{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Σύνδεση</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Είσαι τεχνικός;{' '}
          <Link href="/register-technician" className="text-blue-600 font-semibold hover:underline">Εγγραφή τεχνικού</Link>
        </p>
      </div>
    </div>
  )
}
