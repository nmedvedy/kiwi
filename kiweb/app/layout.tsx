import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diario de Kiwi",
  description: "Crecimiento, recuerdos y aventuras de Kiwi.",
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
