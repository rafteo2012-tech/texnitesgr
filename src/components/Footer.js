import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-extrabold mb-3">Texnites<span className="text-blue-400">GR</span></div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Η μεγαλύτερη πλατφόρμα εύρεσης τεχνικών στην Ελλάδα. Συνδέουμε πελάτες με επαγγελματίες τεχνίτες.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Υπηρεσίες</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/technicians" className="hover:text-white transition-colors">Βρες Τεχνικό</Link></li>
              <li><Link href="/request-service" className="hover:text-white transition-colors">Ζήτηση Υπηρεσίας</Link></li>
              <li><Link href="/register-technician" className="hover:text-white transition-colors">Γίνε Τεχνικός</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Εταιρεία</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Σχετικά με εμάς</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Επικοινωνία</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Όροι χρήσης</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © 2025 TexnitesGR. Όλα τα δικαιώματα διατηρούνται.
        </div>
      </div>
    </footer>
  )
}
