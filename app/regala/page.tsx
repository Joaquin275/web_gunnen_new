import type { Metadata } from "next";
import RegalaClient from "./RegalaClient";

export const metadata: Metadata = {
  title: "Regala una Experiencia",
  description:
    "Regala una experiencia gastronómica única en Gunnen, A Coruña. Bonos regalo con menú degustación. Envío inmediato por email.",
  alternates: { canonical: "https://www.gunnen.es/regala" },
  openGraph: {
    url: "https://www.gunnen.es/regala",
    title: "Regala una Experiencia — Gunnen",
    description:
      "Bono regalo para una experiencia gastronómica única en Gunnen, A Coruña. Menú degustación.",
    images: [{ url: "/images/heroes/regala.jpg", width: 1200, height: 630 }],
  },
};

export default function RegalaPage() {
  return <RegalaClient />;
}
