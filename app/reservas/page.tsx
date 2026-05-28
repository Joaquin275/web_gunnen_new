import type { Metadata } from "next";
import ReservasClient from "./ReservasClient";

export const metadata: Metadata = {
  title: "Reservar Mesa",
  description:
    "Reserva tu mesa en Gunnen, A Coruña. Solo 3 mesas disponibles. Elige fecha, horario y menú degustación.",
  alternates: { canonical: "https://www.gunnen.es/reservas" },
  openGraph: {
    url: "https://www.gunnen.es/reservas",
    title: "Reservar Mesa — Gunnen",
    description:
      "Reserva tu mesa en Gunnen. Solo 3 mesas disponibles, experiencia gastronómica única en A Coruña.",
    images: [{ url: "/images/heroes/reservas.jpg", width: 1200, height: 630 }],
  },
};

export default function ReservasPage() {
  return <ReservasClient />;
}
