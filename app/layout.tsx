import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nmedvedy.github.io"),
  title: "El diario de Kiwi",
  description: "Crecimiento, recuerdos y aventuras de Kiwi.",
  alternates: {
    canonical: "/kiwi/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/kiwi/",
    siteName: "El diario de Kiwi",
    title: "El diario de Kiwi",
    description: "Crecimiento, recuerdos y aventuras de Kiwi.",
    images: [
      {
        url: "https://nmedvedy.github.io/kiwi/kiwi-share.jpg?v=3",
        width: 800,
        height: 800,
        type: "image/jpeg",
        alt: "Kiwi, gatita carey gris con botitas blancas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "El diario de Kiwi",
    description: "Crecimiento, recuerdos y aventuras de Kiwi.",
    images: ["https://nmedvedy.github.io/kiwi/kiwi-share.jpg?v=3"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "./kiwi-favicon.svg",
    shortcut: "./kiwi-favicon.svg",
  },
};

const diaryMigration = `
(() => {
  try {
    const key = "kiwi-diary-v1";
    const latestEntries = [
      {
        id: "weight-3",
        date: "2026-07-27",
        category: "growth",
        title: "Nuevo control de peso",
        notes: "Kiwi registró un peso de 2,22 kg.",
        titleEn: "New weight check",
        notesEn: "Kiwi recorded a weight of 2.22 kg.",
        weightKg: 2.22
      },
      {
        id: "vaccine-trivalent-2",
        date: "2026-07-27",
        category: "health",
        title: "Segunda dosis de vacuna trivalente",
        notes: "Recibió la segunda dosis de su pauta de vacunación trivalente.",
        titleEn: "Second dose of the trivalent vaccine",
        notesEn: "She received the second dose in her trivalent vaccination schedule."
      }
    ];
    const initialEntries = [
      { id: "born", date: "2026-04-02", category: "achievement", title: "Nació Kiwi", notes: "Nació en Valdemorillo, Comunidad de Madrid, España 🇪🇸.", titleEn: "Kiwi was born", notesEn: "She was born in Valdemorillo, Community of Madrid, Spain 🇪🇸." },
      { id: "home", date: "2026-05-22", category: "achievement", title: "Llegó a casa", notes: "Primer día de Kiwi con Nico y Melina.", titleEn: "She arrived home", notesEn: "Kiwi's first day with Nico and Melina." },
      { id: "weight-arrival", date: "2026-05-22", category: "growth", title: "Primer peso registrado", notes: "La pesaron el día que llegó a casa.", titleEn: "First recorded weight", notesEn: "She was weighed on the day she arrived home.", weightKg: 1 },
      { id: "name", date: "2026-05-22", category: "achievement", title: "Ya tiene nombre: Kiwi", notes: "Carey gris, con una franja crema en la cara y botitas blancas.", titleEn: "She already had a name: Kiwi", notesEn: "Grey tortoiseshell, with a cream stripe on her face and white paws." },
      { id: "weight-1", date: "2026-06-16", category: "growth", title: "Segundo control de peso", notes: "Subió 400 g desde que llegó a casa.", titleEn: "Second weight check", notesEn: "She gained 400 g since arriving home.", weightKg: 1.4 },
      { id: "vaccine-trivalent-1", date: "2026-06-27", category: "health", title: "Primera dosis de vacuna trivalente", notes: "Primer registro de su pauta de vacunación trivalente.", titleEn: "First dose of the trivalent vaccine", notesEn: "The first record in her trivalent vaccination schedule." },
      { id: "kneading", date: "2026-07-09", category: "behavior", title: "Amasa su camita", notes: "Lo hace a diario durante un rato y ronronea.", titleEn: "She kneads her bed", notesEn: "She does it every day for a while and purrs." },
      { id: "weight-2", date: "2026-07-10", category: "growth", title: "Nuevo control de peso", notes: "Subió 500 g desde el registro anterior.", titleEn: "New weight check", notesEn: "She gained 500 g since the previous record.", weightKg: 1.9 },
      { id: "harness", date: "2026-07-11", category: "training", title: "Exploró el ático con arnés", notes: "Paseo supervisado; se mostró curiosa y contenta.", titleEn: "She explored the attic in her harness", notesEn: "A supervised walk; she was curious and happy." },
      { id: "first-vomit", date: "2026-07-14", category: "health", title: "Primer vómito", notes: "Hoy Kiwi vomitó por primera vez.", titleEn: "First time vomiting", notesEn: "Today Kiwi vomited for the first time." },
      ...latestEntries
    ];
    const saved = window.localStorage.getItem(key);
    if (!saved) {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, entries: initialEntries }));
      return;
    }
    const parsed = JSON.parse(saved);
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    const ids = new Set(entries.map((entry) => entry.id));
    const missing = latestEntries.filter((entry) => !ids.has(entry.id));
    if (missing.length) {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, entries: [...entries, ...missing] }));
    }
  } catch {
    // The page will continue with its built-in initial data if local storage is unavailable.
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <script dangerouslySetInnerHTML={{ __html: diaryMigration }} />
        {children}
      </body>
    </html>
  );
}
