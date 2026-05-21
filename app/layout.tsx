import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Coolvetica — tipografía principal en toda la web
const coolvetica = localFont({
  src: [
    { path: "../public/fonts/coolvetica-light.otf",   weight: "300", style: "normal" },
    { path: "../public/fonts/coolvetica-regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/coolvetica-bold.otf",    weight: "600", style: "normal" },
  ],
  variable: "--font-coolvetica",
  display: "swap",
});

// Brefa — solo para el título principal del Hero
// Nota: sustituir brefa-round.woff2 por brefa.woff2 cuando se disponga del archivo
const brefa = localFont({
  src: [
    { path: "../public/fonts/brefa-round.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/brefa-round.woff",  weight: "400", style: "normal" },
  ],
  variable: "--font-brefa",
  display: "swap",
});

// Brefa Round — solo para los títulos de los menús (TEMPO, IMPULSO)
const brefaRound = localFont({
  src: [
    { path: "../public/fonts/brefa-round.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/brefa-round.woff",  weight: "400", style: "normal" },
  ],
  variable: "--font-brefa-round",
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
    <html lang="es" className={`${coolvetica.variable} ${brefa.variable} ${brefaRound.variable}`}>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
