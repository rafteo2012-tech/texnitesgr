export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-extrabold text-blue-600">
            TexnitesGR
          </h1>

          <nav className="flex gap-6">
            <a href="/">Αρχική</a>
            <a href="/services">Υπηρεσίες</a>
            <a href="/technicians">Τεχνικοί</a>
            <a href="/request-service">Ζήτηση Υπηρεσίας</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Βρες Επαγγελματίες Τεχνίτες Εύκολα
          </h1>

          <p className="mb-8 text-xl">
            Υδραυλικοί, ηλεκτρολόγοι, ψυκτικοί και πολλές ακόμα υπηρεσίες.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="/technicians"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600"
            >
              Βρες Τεχνικό
            </a>

            <a
              href="/register-technician"
              className="rounded-xl border border-white px-6 py-3 font-semibold"
            >
              Γίνε Συνεργάτης
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-center text-4xl font-bold">
          Δημοφιλείς Υπηρεσίες
        </h2>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            "Υδραυλικοί",
            "Ηλεκτρολόγοι",
            "Ψυκτικοί",
            "Καθαρισμοί",
            "Κλειδαράδες",
            "Κηπουροί",
            "Μετακομίσεις",
            "Ελαιοχρωματιστές",
          ].map((service) => (
            <div
              key={service}
              className="rounded-2xl bg-white p-6 shadow"
            >
              <div className="mb-3 text-4xl">🔧</div>

              <h3 className="font-bold">{service}</h3>

              <p className="mt-2 text-sm text-gray-600">
                Βρες επαγγελματίες με αξιολογήσεις.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center text-4xl font-bold">
            Γιατί TexnitesGR;
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl p-6 shadow">
              <h3 className="mb-3 text-xl font-bold">
                Επαληθευμένοι Τεχνικοί
              </h3>

              <p>
                Συνεργαζόμαστε με αξιόπιστους επαγγελματίες.
              </p>
            </div>

            <div className="rounded-2xl p-6 shadow">
              <h3 className="mb-3 text-xl font-bold">
                Γρήγορη Εξυπηρέτηση
              </h3>

              <p>
                Βρες τον κατάλληλο τεχνικό μέσα σε λίγα λεπτά.
              </p>
            </div>

            <div className="rounded-2xl p-6 shadow">
              <h3 className="mb-3 text-xl font-bold">
                Πραγματικές Αξιολογήσεις
              </h3>

              <p>
                Διάβασε κριτικές και επίλεξε με σιγουριά.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 text-center text-white">
        <h3 className="text-2xl font-bold">TexnitesGR</h3>

        <p className="mt-3 text-gray-400">
          Η μεγαλύτερη πλατφόρμα εύρεσης τεχνικών στην Ελλάδα.
        </p>
      </footer>
    </main>
  );
}