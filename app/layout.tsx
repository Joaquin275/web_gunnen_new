import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
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
