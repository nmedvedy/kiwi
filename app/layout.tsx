import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nmedvedy.github.io"),
  title: "Diario de Kiwi",
  description: "Crecimiento, recuerdos y aventuras de Kiwi.",
  alternates: {
    canonical: "/kiwi/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/kiwi/",
    siteName: "Diario de Kiwi",
    title: "Diario de Kiwi",
    description: "Crecimiento, recuerdos y aventuras de Kiwi.",
    images: [
      {
        url: "/kiwi/kiwi-carey-gris.png",
        width: 1254,
        height: 1254,
        alt: "Kiwi, gatita carey gris con botitas blancas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diario de Kiwi",
    description: "Crecimiento, recuerdos y aventuras de Kiwi.",
    images: ["/kiwi/kiwi-carey-gris.png"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
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
