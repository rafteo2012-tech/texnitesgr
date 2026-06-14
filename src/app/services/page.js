import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const services = [
  { icon: '🔧', label: 'Υδραυλικοί', slug: 'plumber', desc: 'Επισκευές, εγκαταστάσεις, αποφράξεις και ό,τι άλλο χρειαστείς.' },
  { icon: '⚡', label: 'Ηλεκτρολόγοι', slug: 'electrician', desc: 'Ηλεκτρολογικές εγκαταστάσεις, βλάβες και πιστοποιητικά.' },
  { icon: '❄️', label: 'Ψυκτικοί', slug: 'hvac', desc: 'Τοποθέτηση και σέρβις κλιματιστικών, ψυγείων και αντλιών θερμότητας.' },
  { icon: '🔑', label: 'Κλειδαράδες', slug: 'locksmith', desc: 'Άνοιγμα κλειδαριών, αντικατάσταση και ενίσχυση ασφάλειας.' },
  { icon: '🧹', label: 'Καθαρισμοί', slug: 'cleaning', desc: 'Γενικός καθαρισμός σπιτιού, γραφείου και μετά ανακαίνιση.' },
  { icon: '🌿', label: 'Κηπουροί', slug: 'gardener', desc: 'Κούρεμα, φύτευση, σχεδιασμός κήπου και αρδευτικά.' },
  { icon: '🎨', label: 'Ελαιοχρωματιστές', slug: 'painter', desc: 'Βαφή εσωτερικών, εξωτερικών και ειδικές τεχνικές.' },
  { icon: '🚛', label: 'Μετακομίσεις', slug: 'moving', desc: 'Μεταφορά επίπλων, συσκευασία και αποθήκευση.' },
  { icon: '📱', label: 'Τεχνικοί Συσκευών', slug: 'appliance_repair', desc: 'Επισκευή πλυντηρίων, ψυγείων, κουζινών και ηλεκτρονικών.' },
  { icon: '🏗️', label: 'Οικοδομικές', slug: 'construction', desc: 'Ανακαινίσεις, γυψοσανίδες, πλακάκια και μικροδομικές εργασίες.' },
]

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-3">Υπηρεσίες</h1>
        <p className="text-center text-gray-500 mb-12">Βρες τον κατάλληλο επαγγελματία για κάθε ανάγκη</p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map(s => (
            <Link key={s.slug} href={`/technicians?category=${s.slug}`}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{s.label}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
              <div className="mt-4 text-blue-600 text-sm font-semibold">Βρες τεχνικό →</div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
