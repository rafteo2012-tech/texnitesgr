import "./globals.css";

export const metadata = {
  title: "TexnitesGR — Βρες Τεχνικό Κοντά σου",
  description: "Η μεγαλύτερη πλατφόρμα εύρεσης τεχνικών στην Ελλάδα. Υδραυλικοί, ηλεκτρολόγοι, ψυκτικοί και πολλά ακόμα.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="el" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
