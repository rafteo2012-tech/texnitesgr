import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const categories = [
  { icon: '🔧', label: 'Υδραυλικοί',       slug: 'plumber' },
  { icon: '⚡', label: 'Ηλεκτρολόγοι',     slug: 'electrician' },
  { icon: '❄️', label: 'Ψυκτικοί',          slug: 'hvac' },
  { icon: '🔑', label: 'Κλειδαράδες',       slug: 'locksmith' },
  { icon: '🧹', label: 'Καθαρισμοί',        slug: 'cleaning' },
  { icon: '🌿', label: 'Κηπουροί',           slug: 'gardener' },
  { icon: '🎨', label: 'Ελαιοχρωματιστές',  slug: 'painter' },
  { icon: '🚛', label: 'Μετακομίσεις',       slug: 'moving' },
  { icon: '📱', label: 'Τεχνικοί Συσκευών', slug: 'appliance_repair' },
  { icon: '🏗️', label: 'Οικοδομικές',        slug: 'construction' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Βρες τον τεχνικό<br />που χρειάζεσαι
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
            Χιλιάδες επαγγελματίες τεχνίτες σε όλη την Ελλάδα. Αξιολογήσεις, τιμές και άμεση επικοινωνία.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/technicians" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Βρες Τεχνικό
            </Link>
            <Link href="/request-service" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-colors text-lg">
              Ζήτησε Προσφορά
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { num: '500+', label: 'Τεχνικοί' },
            { num: '2.000+', label: 'Ολοκληρωμένες εργασίες' },
            { num: '4.8★', label: 'Μέση αξιολόγηση' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-blue-600">{s.num}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Κατηγορίες Υπηρεσιών</h2>
        <p className="text-center text-gray-500 mb-12">Επίλεξε κατηγορία για να βρεις τον κατάλληλο επαγγελματία</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/technicians?category=${cat.slug}`}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Γιατί TexnitesGR;</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '✅', title: 'Επαληθευμένοι Τεχνικοί', desc: 'Όλοι οι τεχνικοί ελέγχονται πριν εγγραφούν στην πλατφόρμα.' },
              { icon: '⚡', title: 'Γρήγορη Εξυπηρέτηση', desc: 'Βρες και επικοινώνησε με τεχνικό μέσα σε λίγα λεπτά.' },
              { icon: '⭐', title: 'Πραγματικές Αξιολογήσεις', desc: 'Κριτικές μόνο από πελάτες που έχουν χρησιμοποιήσει την υπηρεσία.' },
            ].map(f => (
              <div key={f.title} className="text-center p-6 rounded-2xl bg-gray-50">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Είσαι τεχνικός;</h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">Δημιούργησε το επαγγελματικό σου προφίλ και βρες νέους πελάτες κάθε μέρα.</p>
        <Link href="/register-technician" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors">
          Εγγραφή Τεχνικού — Δωρεάν
        </Link>
      </section>

      <Footer />
    </main>
  )
}
