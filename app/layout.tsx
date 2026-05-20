import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

// Coolvetica Light — tipografía para títulos y headings (igual que gunnen.es)
const cormorant = localFont({
  src: [
    { path: "../public/fonts/coolvetica-light.otf",   weight: "300", style: "normal" },
    { path: "../public/fonts/coolvetica-regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/coolvetica-bold.otf",    weight: "700", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

// Brefa Round — tipografía para cuerpo de texto y UI (igual que gunnen.es)
const inter = localFont({
  src: [
    { path: "../public/fonts/brefa-round.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/brefa-round.woff",  weight: "400", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gunnen Alegría Compartida",
  description: "Experiencia gastronómica de vanguardia. Reserva tu mesa y descubre una cocina innovadora.",
  keywords: ["restaurante", "alta gastronomía", "cocina innovadora", "menú degustación"],
  authors: [{ name: "Gunnen" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Gunnen",
    title: "Gunnen — Alegría Compartida",
    description: "Experiencia gastronómica de vanguardia",
  },
};

import LayoutShell from "@/components/layout/LayoutShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
