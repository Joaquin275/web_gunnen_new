import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes somos — Gunnen",
  description: "Conoce nuestra historia, filosofía y el equipo detrás de Gunnen.",
};

export default function QuienesSomosPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display font-serif font-light mb-6">
            Nuestra historia
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Más que un restaurante, una filosofía de vida dedicada
            a la excelencia y la innovación gastronómica.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="section-container bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="editorial-grid items-center">
            <div className="md:col-span-6">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative group">
                {/* Placeholder elegante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <img 
                      src="/images/logo/gunnen-logo.svg" 
                      alt="Gunnen" 
                      className="h-20 w-auto opacity-20 mb-4 mx-auto"
                    />
                    <div className="text-sm tracking-[0.3em] uppercase text-gray-300">
                      Nuestra Historia
                    </div>
                  </div>
                </div>
                
                {/* Cuando tengas la imagen: */}
                {/* <img 
                  src="/images/restaurant/historia.jpg" 
                  alt="Historia de Gunnen"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                /> */}
              </div>
            </div>
            <div className="md:col-span-6 space-y-6 text-lg leading-relaxed text-gray-700">
              <p>
                Gunnen nace de un sueño: crear un espacio donde la gastronomía
                trascienda su forma tradicional para convertirse en una experiencia
                transformadora.
              </p>
              <p>
                Desde nuestros inicios, hemos mantenido un compromiso inquebrantable
                con la calidad, la innovación y el respeto por la materia prima.
                Cada día es una oportunidad para sorprender, para cuestionar
                lo establecido y para celebrar la riqueza de nuestra tierra.
              </p>
              <p>
                Nuestro equipo está formado por profesionales apasionados que
                comparten esta visión y trabajan incansablemente para hacer
                de cada servicio un momento memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section className="section-container">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-hero font-serif font-light mb-4">Nuestra filosofía</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="text-2xl font-serif font-light mb-4">Excelencia</h3>
              <p className="text-gray-600 leading-relaxed">
                Cada plato, cada gesto, cada detalle es cuidado con máxima atención.
                La excelencia no es un destino, es un camino que recorremos cada día.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-light mb-4">Innovación</h3>
              <p className="text-gray-600 leading-relaxed">
                La tradición es nuestro punto de partida, pero la innovación
                es nuestro motor. Exploramos constantemente nuevas técnicas
                y combinaciones.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-light mb-4">Sostenibilidad</h3>
              <p className="text-gray-600 leading-relaxed">
                Trabajamos exclusivamente con productores locales comprometidos
                con prácticas sostenibles. El futuro de la gastronomía es responsable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="section-container bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-hero font-serif font-light mb-4">El equipo</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Profesionales apasionados unidos por una visión común
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Chef - placeholder */}
            <div className="group">
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-700 mb-6 overflow-hidden relative">
                {/* Placeholder elegante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-7xl font-serif font-light mb-4 opacity-30">
                      Chef
                    </div>
                    <div className="text-sm tracking-[0.3em] uppercase opacity-50">
                      Ejecutivo
                    </div>
                  </div>
                </div>
                
                {/* Cuando tengas la foto: */}
                {/* <img 
                  src="/images/team/chef.jpg" 
                  alt="Chef Ejecutivo"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                /> */}
              </div>
              <h3 className="text-2xl font-serif font-light mb-2">Chef Ejecutivo</h3>
              <p className="text-sm tracking-wider uppercase text-gray-500 mb-4">
                Cocina y dirección
              </p>
              <p className="text-gray-600 leading-relaxed">
                Con más de 15 años de experiencia en cocinas de todo el mundo,
                lidera el proyecto con pasión y visión innovadora.
              </p>
            </div>
            {/* Sumiller - placeholder */}
            <div className="group">
              <div className="aspect-[3/4] bg-gradient-to-br from-amber-900 to-amber-800 mb-6 overflow-hidden relative">
                {/* Placeholder elegante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-7xl font-serif font-light mb-4 opacity-30">
                      Sumiller
                    </div>
                    <div className="text-sm tracking-[0.3em] uppercase opacity-50">
                      Premium
                    </div>
                  </div>
                </div>
                
                {/* Cuando tengas la foto: */}
                {/* <img 
                  src="/images/team/sumiller.jpg" 
                  alt="Sumiller"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                /> */}
              </div>
              <h3 className="text-2xl font-serif font-light mb-2">Sumiller</h3>
              <p className="text-sm tracking-wider uppercase text-gray-500 mb-4">
                Maridajes y bodega
              </p>
              <p className="text-gray-600 leading-relaxed">
                Experto en vinos y destilados, crea maridajes únicos que
                potencian cada plato y elevan la experiencia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
