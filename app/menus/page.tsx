import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nuestros Menús — Gunnen",
  description: "Descubre nuestras propuestas gastronómicas: menú degustación, maridaje premium y experiencia vegetal.",
};

const menus = [
  {
    slug: "tempo",
    name: "Tempo",
    price: "100€",
    image: "/images/menus/tempo.jpg",
    image2: "/images/menus/tempo-2.jpg",
    description: "Nuestra invitación a entrar hasta la cocina, a olvidarte del reloj y de las prisas. Un recorrido más extenso por nuestra forma de entender la materia prima y el entorno.",
    highlights: [
      "14 bocados (11 del mundo salado + 3 del mundo dulce)",
      "Incluye pan + petit fours",
      "Propuesta de Armonía con vino (+45€)",
      "Propuesta de Armonía No/Low elaboración propia (+30€)",
    ],
  },
  {
    slug: "impulso",
    name: "Impulso",
    price: "80€",
    image: "/images/menus/impulso.jpg",
    image2: "/images/menus/impulso-2.jpg",
    description: "Nuestra versión más inmediata, una propuesta que puede funcionar como puerta de entrada o si no dispones de mucho tiempo. Cocina ágil, estacional y de producto.",
    highlights: [
      "11 bocados (9 del mundo salado + 2 del mundo dulce)",
      "Incluye pan + petit fours",
      "Propuesta de Armonía con vino (+45€)",
      "Propuesta de Armonía No/Low elaboración propia (+30€)",
    ],
  },
];

export default function MenusPage() {
  return (
    <div>
      {/* Hero con imagen */}
      <section className="relative h-[75vh] min-h-[520px] overflow-hidden">
        <Image
          src="/images/menus/tempo.jpg"
          alt="Menús Gunnen"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">Nuestros menús degustación</p>
          <h1
            className="text-white uppercase tracking-[0.15em] font-light"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Menús
          </h1>
          <p className="text-white/75 mt-4 max-w-lg text-base leading-relaxed font-light">
            Impulso · Tempo
          </p>
        </div>
      </section>

      {/* Lista de menús */}
      <section className="section-container bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-16">
          {menus.map((menu, index) => (
            <article key={menu.slug}>
              <Link href={`/menus/${menu.slug}`} className="group block">
                <div className="editorial-grid items-center gap-12">
                  {/* Imagen del menú */}
                  <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="aspect-[4/3] overflow-hidden relative group-hover:shadow-xl transition-all duration-500">
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="flex items-baseline justify-between mb-4 gap-2">
                      <h2 className="text-2xl sm:text-4xl font-brefa-round group-hover:text-accent transition-colors" style={{ fontWeight: 400 }}>
                        {menu.name}
                      </h2>
                      <span className="text-xl sm:text-3xl font-sans font-light text-gray-400 flex-shrink-0">
                        {menu.price}
                      </span>
                    </div>
                    <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                      {menu.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {menu.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-accent rounded-full mt-2.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="inline-block text-sm tracking-wider uppercase text-gray-500 group-hover:text-primary transition-colors">
                      Ver detalle completo →
                    </span>
                  </div>
                </div>
              </Link>
              {index < menus.length - 1 && <div className="divider mt-16" />}
            </article>
          ))}
        </div>
      </section>

      {/* CTA Reserva */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto text-center bg-gray-50 p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-light mb-6">
            ¿Listo para vivir la experiencia?
          </h2>
          <p className="text-gray-600 mb-8">
            Reserva tu mesa y déjanos sorprenderte
          </p>
          <Link href="/reservas" className="btn-primary">
            Reservar ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
