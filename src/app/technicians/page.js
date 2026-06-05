export default function TechniciansPage() {
  const technicians = [
    {
      id: 1,
      name: "Γιώργος Παπαδόπουλος",
      profession: "Υδραυλικός",
      city: "Αθήνα",
      rating: "4.9",
      phone: "2101234567",
    },
    {
      id: 2,
      name: "Νίκος Δημητρίου",
      profession: "Ηλεκτρολόγος",
      city: "Θεσσαλονίκη",
      rating: "4.8",
      phone: "2310123456",
    },
    {
      id: 3,
      name: "Μαρία Κωνσταντίνου",
      profession: "Ψυκτικός",
      city: "Πάτρα",
      rating: "5.0",
      phone: "2610123456",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="mb-4 text-center text-5xl font-bold text-blue-600">
        Βρες Τεχνικό
      </h1>

      <p className="mb-12 text-center text-gray-600">
        Επίλεξε επαγγελματία με αξιολογήσεις και εμπειρία.
      </p>

      <div className="grid gap-8 md:grid-cols-3">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-4xl">
              👷
            </div>

            <h2 className="text-2xl font-bold">
              {tech.name}
            </h2>

            <p className="mt-2 font-medium text-blue-600">
              {tech.profession}
            </p>

            <p className="mt-2 text-gray-600">
              📍 {tech.city}
            </p>

            <p className="mt-2">
              ⭐ {tech.rating}
            </p>

            <p className="mt-2 text-gray-600">
              📞 {tech.phone}
            </p>

            <a
  href="/request-service"
  className="mt-6 block w-full rounded-2xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
>
  Κλείσε Ραντεβού
</a>
          </div>
        ))}
      </div>
    </main>
  );
}