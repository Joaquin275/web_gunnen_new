import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Datos de los menús reales de Gunnen
const menusData: Record<string, any> = {
  "tempo": {
    name: "Tempo",
    price: "100€",
    description: "Nuestra invitación a entrar hasta la cocina, a olvidarte del reloj y de las prisas. Un recorrido más extenso por nuestra forma de entender la materia prima y el entorno.",
    duration: "14 bocados · 11 del mundo salado + 3 del mundo dulce",
    courses: [
      { name: "Bocado 01", description: "Primer momento del mundo salado · temporada" },
      { name: "Bocado 02", description: "Segundo momento del mundo salado · temporada" },
      { name: "Bocado 03", description: "Tercer momento del mundo salado · temporada" },
      { name: "Bocado 04", description: "Cuarto momento del mundo salado · temporada" },
      { name: "Bocado 05", description: "Quinto momento del mundo salado · temporada" },
      { name: "Bocado 06", description: "Sexto momento del mundo salado · temporada" },
      { name: "Bocado 07", description: "Séptimo momento del mundo salado · temporada" },
      { name: "Bocado 08", description: "Octavo momento del mundo salado · temporada" },
      { name: "Bocado 09", description: "Noveno momento del mundo salado · temporada" },
      { name: "Bocado 10", description: "Primer momento del mundo dulce · temporada" },
      { name: "Bocado 11", description: "Segundo momento del mundo dulce · temporada" },
      { name: "Bocado 12", description: "Tercer momento del mundo dulce · temporada" },
      { name: "Cierre", description: "Pan incluido + Petit fours" },
    ],
    allergens: ["Gluten", "Lácteos", "Pescado", "Marisco", "Frutos secos"],
    notes: "Precio con I.V.A. incluido. Bodega no incluida. Propuesta de Armonía con vino (+45€). Propuesta de Armonía No/Low elaboración propia (+30€). Menú sujeto a cambios según disponibilidad de producto de temporada. Adaptable a alergias e intolerancias con aviso previo.",
  },
  "impulso": {
    name: "Impulso",
    price: "80€",
    description: "Nuestra versión más inmediata, una propuesta que puede funcionar como puerta de entrada o si no dispones de mucho tiempo. Cocina ágil, estacional y de producto.",
    duration: "11 bocados · 9 del mundo salado + 2 del mundo dulce",
    courses: [
      { name: "Bocado 01", description: "Primer momento del mundo salado · temporada" },
      { name: "Bocado 02", description: "Segundo momento del mundo salado · temporada" },
      { name: "Bocado 03", description: "Tercer momento del mundo salado · temporada" },
      { name: "Bocado 04", description: "Cuarto momento del mundo salado · temporada" },
      { name: "Bocado 05", description: "Quinto momento del mundo salado · temporada" },
      { name: "Bocado 06", description: "Sexto momento del mundo salado · temporada" },
      { name: "Bocado 07", description: "Séptimo momento del mundo salado · temporada" },
      { name: "Bocado 08", description: "Octavo momento del mundo salado · temporada" },
      { name: "Bocado 09", description: "Noveno momento del mundo salado · temporada" },
      { name: "Bocado 10", description: "Primer momento del mundo dulce · temporada" },
      { name: "Bocado 11", description: "Segundo momento del mundo dulce · temporada" },
      { name: "Cierre", description: "Pan incluido + Petit fours" },
    ],
    allergens: ["Gluten", "Lácteos", "Pescado", "Marisco", "Frutos secos"],
    notes: "Precio con I.V.A. incluido. Bodega no incluida. Propuesta de Armonía con vino (+45€). Propuesta de Armonía No/Low elaboración propia (+30€). Menú sujeto a cambios según disponibilidad de producto de temporada. Adaptable a alergias e intolerancias con aviso previo.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const menu = menusData[slug];
  if (!menu) {
    return { title: "Menú no encontrado" };
  }
  return {
    title: `${menu.name} — Gunnen`,
    description: menu.description,
  };
}

export default async function MenuDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const menu = menusData[slug];

  if (!menu) {
    notFound();
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/menus"
            className="inline-block text-sm tracking-wider uppercase text-gray-500 hover:text-primary transition-colors mb-8"
          >
            ← Volver a menús
          </Link>
          <div className="flex items-baseline justify-between mb-6">
            <h1 className="text-display font-serif font-light">
              {menu.name}
            </h1>
            <span className="text-5xl font-serif font-light text-accent">
              {menu.price}
            </span>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed mb-4">
            {menu.description}
          </p>
          <p className="text-sm tracking-wider uppercase text-gray-500">
            {menu.duration}
          </p>
        </div>
      </section>

      {/* Platos */}
      <section className="section-container bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-light mb-12">Recorrido gastronómico</h2>
          <div className="space-y-8">
            {menu.courses.map((course: any, index: number) => (
              <div key={index} className="pb-8 border-b border-gray-200 last:border-0">
                <div className="flex items-start gap-6">
                  <span className="text-sm tracking-wider uppercase text-gray-400 mt-1 w-8 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-grow">
                    <h3 className="text-xl font-serif font-light mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alérgenos y notas */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-serif font-light mb-4">Alérgenos</h3>
              <div className="flex flex-wrap gap-2">
                {menu.allergens.map((allergen: string) => (
                  <span
                    key={allergen}
                    className="px-4 py-2 bg-gray-100 text-sm tracking-wider uppercase text-gray-600"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-serif font-light mb-4">Notas importantes</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {menu.notes}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-container bg-accent text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-light mb-6">
            Reserva tu experiencia
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Déjanos sorprenderte con esta propuesta única
          </p>
          <Link href="/reservas" className="btn-primary bg-white text-accent hover:bg-gray-100">
            Reservar mesa
          </Link>
        </div>
      </section>
    </div>
  );
}
