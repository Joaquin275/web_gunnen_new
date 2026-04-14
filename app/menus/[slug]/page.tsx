import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Datos de los menús reales de Gunnen
const menusData: Record<string, any> = {
  "tempo": {
    name: "Tempo",
    price: "100€",
    description: "Nuestra invitación a entrar hasta la cocina, a olvidarte del reloj y de las prisas. Un recorrido más extenso por nuestra forma de entender la materia prima y el entorno.",
    duration: "Bebida Natural + Snack (Bienvenida) | 2 Snacks + 8 platos + 2 postres",
    courses: [
      { name: "Bienvenida", description: "Bebida natural de la casa + Snack de bienvenida" },
      { name: "Snack 1", description: "Primer bocado sorpresa de temporada" },
      { name: "Snack 2", description: "Segundo bocado con producto local" },
      { name: "Plato 1", description: "Entrada fría con producto de mar" },
      { name: "Plato 2", description: "Entrada caliente de la huerta" },
      { name: "Plato 3", description: "Verduras de temporada" },
      { name: "Plato 4", description: "Pescado del día" },
      { name: "Plato 5", description: "Intermedio refrescante" },
      { name: "Plato 6", description: "Producto de la tierra" },
      { name: "Plato 7", description: "Principal del menú" },
      { name: "Plato 8", description: "Transición al dulce" },
      { name: "Postre 1", description: "Preludio dulce" },
      { name: "Postre 2", description: "Gran final" },
      { name: "Cierre", description: "Pan incluido + Petit fours" },
    ],
    allergens: ["Gluten", "Lácteos", "Pescado", "Marisco", "Frutos secos"],
    notes: "Precio con I.V.A. incluido. Bodega no incluida. Opción maridaje (+56€). Menú sujeto a cambios según disponibilidad de producto de temporada. Adaptable a alergias e intolerancias con aviso previo.",
  },
  "impulso": {
    name: "Impulso",
    price: "80€",
    description: "Nuestra versión más inmediata, una propuesta que puede funcionar como puerta de entrada o si no dispones de mucho tiempo. Cocina ágil, estacional y de producto.",
    duration: "Bebida Natural + Snack (Bienvenida) | 2 Snacks + 6 platos + 1 postre",
    courses: [
      { name: "Bienvenida", description: "Bebida natural de la casa + Snack de bienvenida" },
      { name: "Snack 1", description: "Primer bocado sorpresa de temporada" },
      { name: "Snack 2", description: "Segundo bocado con producto local" },
      { name: "Plato 1", description: "Entrada fría con producto de mar" },
      { name: "Plato 2", description: "Verduras de temporada" },
      { name: "Plato 3", description: "Pescado del día" },
      { name: "Plato 4", description: "Producto de la tierra" },
      { name: "Plato 5", description: "Principal del menú" },
      { name: "Plato 6", description: "Transición al dulce" },
      { name: "Postre", description: "Gran final dulce" },
      { name: "Cierre", description: "Pan incluido + Petit fours" },
    ],
    allergens: ["Gluten", "Lácteos", "Pescado", "Marisco", "Frutos secos"],
    notes: "Precio con I.V.A. incluido. Bodega no incluida. Opción maridaje (+48€). Menú sujeto a cambios según disponibilidad de producto de temporada. Adaptable a alergias e intolerancias con aviso previo.",
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const menu = menusData[params.slug];
  if (!menu) {
    return { title: "Menú no encontrado" };
  }
  return {
    title: `${menu.name} — Gunnen`,
    description: menu.description,
  };
}

export default function MenuDetailPage({ params }: { params: { slug: string } }) {
  const menu = menusData[params.slug];

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
