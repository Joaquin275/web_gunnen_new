import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Experience from "@/components/home/Experience";
import FreshQuality from "@/components/home/FreshQuality";
import MenusPreview from "@/components/home/MenusPreview";
import PressPreview from "@/components/home/PressPreview";
import GiftCardBanner from "@/components/home/GiftCardBanner";

export const metadata: Metadata = {
  title: "Gunnen — Alegría Compartida | Restaurante A Coruña",
  description:
    "Restaurante Gunnen en A Coruña. Cocina de autor, menú degustación y productos del Atlántico. Vive una experiencia gastronómica única.",
  alternates: { canonical: "https://www.gunnen.es" },
  openGraph: {
    url: "https://www.gunnen.es",
    title: "Gunnen — Alegría Compartida | Restaurante A Coruña",
    description:
      "Restaurante Gunnen en A Coruña. Cocina de autor, menú degustación y productos del Atlántico.",
    images: [{ url: "/images/heroes/quienes-somos.jpg", width: 1200, height: 630 }],
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Gunnen",
  alternateName: "Gunnen Alegría Compartida",
  description:
    "Restaurante de cocina de autor en A Coruña. Menú degustación con productos del Atlántico y de temporada.",
  url: "https://www.gunnen.es",
  telephone: "+34 881 89 98 99",
  servesCuisine: ["Española", "Cocina de autor", "Gastronomía atlántica"],
  priceRange: "€€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rúa de Santo André, 31",
    addressLocality: "A Coruña",
    addressRegion: "Galicia",
    postalCode: "15003",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.3712,
    longitude: -8.3966,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "13:30",
      closes: "15:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Thursday", "Friday", "Saturday"],
      opens: "20:30",
      closes: "23:00",
    },
  ],
  hasMap: "https://maps.google.com/?q=Gunnen+A+Coruña",
  image: "https://www.gunnen.es/images/heroes/quienes-somos.jpg",
  menu: "https://www.gunnen.es/menus",
  acceptsReservations: true,
  sameAs: ["https://www.instagram.com/gunnen_restaurante"],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <Hero />
      <Experience />
      <FreshQuality />
      <MenusPreview />
      <PressPreview />
      <GiftCardBanner />
    </>
  );
}
