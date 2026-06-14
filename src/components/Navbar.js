'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
          Texnites<span className="text-gray-900">GR</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/services" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Υπηρεσίες</Link>
          <Link href="/technicians" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Τεχνικοί</Link>
          <Link href="/request-service" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Ζήτηση Υπηρεσίας</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-500 transition-colors">Αποσύνδεση</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">Σύνδεση</Link>
              <Link href="/register-technician" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Γίνε Τεχνικός
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-700"></div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/services" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Υπηρεσίες</Link>
          <Link href="/technicians" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Τεχνικοί</Link>
          <Link href="/request-service" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Ζήτηση Υπηρεσίας</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-left text-red-500">Αποσύνδεση</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Σύνδεση</Link>
              <Link href="/register-technician" className="text-sm text-blue-600 font-semibold" onClick={() => setMenuOpen(false)}>Γίνε Τεχνικός</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
