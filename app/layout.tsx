import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

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
  metadataBase: new URL("https://www.gunnen.es"),
  verification: {
    google: "7Z_vnhDG2k4p91y5rVHmevVBUiKnLV_1z_jMPrDrpqk",
  },
  title: {
    default: "Gunnen — Alegría Compartida | Restaurante A Coruña",
    template: "%s | Gunnen",
  },
  description:
    "Restaurante Gunnen en A Coruña. Cocina de autor y experiencia gastronómica única. Menú degustación con productos del Atlántico. Reserva tu mesa.",
  keywords: [
    "restaurante A Coruña",
    "restaurante Gunnen",
    "menú degustación A Coruña",
    "cocina de autor Galicia",
    "alta gastronomía A Coruña",
    "restaurante Galicia",
    "Alegría Compartida",
  ],
  authors: [{ name: "Gunnen", url: "https://www.gunnen.es" }],
  creator: "Gunnen",
  publisher: "La Familia Gastro S.L.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://www.gunnen.es",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.gunnen.es",
    siteName: "Gunnen",
    title: "Gunnen — Alegría Compartida | Restaurante A Coruña",
    description:
      "Restaurante Gunnen en A Coruña. Cocina de autor, menú degustación y productos del Atlántico. Reserva tu mesa.",
    images: [
      {
        url: "/images/heroes/quienes-somos.jpg",
        width: 1200,
        height: 630,
        alt: "Restaurante Gunnen — A Coruña",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gunnen — Alegría Compartida | Restaurante A Coruña",
    description:
      "Cocina de autor y experiencia gastronómica única en A Coruña. Reserva tu mesa.",
    images: ["/images/heroes/quienes-somos.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
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
      </body>
    </html>
  );
}
