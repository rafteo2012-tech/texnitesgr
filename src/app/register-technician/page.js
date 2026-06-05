export default function RegisterTechnicianPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-4xl font-bold text-blue-600">
          Εγγραφή Τεχνικού
        </h1>

        <p className="mb-8 text-gray-600">
          Συμπληρώστε τα στοιχεία σας για να γίνετε συνεργάτης του TexnitesGR.
        </p>

        <form className="space-y-4">

          <input
            type="text"
            placeholder="Ονοματεπώνυμο"
            className="w-full rounded-xl border p-3"
          />

          <select className="w-full rounded-xl border p-3">
            <option>Επιλέξτε Επάγγελμα</option>
            <option>Υδραυλικός</option>
            <option>Ηλεκτρολόγος</option>
            <option>Ψυκτικός</option>
            <option>Κλειδαράς</option>
            <option>Κηπουρός</option>
            <option>Ελαιοχρωματιστής</option>
          </select>

          <input
            type="text"
            placeholder="Πόλη"
            className="w-full rounded-xl border p-3"
          />

          <input
            type="tel"
            placeholder="Τηλέφωνο"
            className="w-full rounded-xl border p-3"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border p-3"
          />

          <input
            type="number"
            placeholder="Χρόνια Εμπειρίας"
            className="w-full rounded-xl border p-3"
          />

          <textarea
            placeholder="Περιγραφή υπηρεσιών και εμπειρίας"
            className="h-40 w-full rounded-xl border p-3"
          />

          <button
            className="w-full rounded-xl bg-blue-600 p-4 font-semibold text-white hover:bg-blue-700"
          >
            Υποβολή Αίτησης
          </button>

        </form>
      </div>
    </main>
  );
} 