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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
