import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Quiénes somos — Gunnen",
  description:
    "Gunnen significa alegría compartida. Conoce nuestra filosofía, nuestro espacio y nuestra cocina de temporada.",
};

export default function QuienesSomosPage() {
  return (
    <div>

      {/* ── Hero visual ─────────────────────────────────────────────── */}
      <section className="relative h-[75vh] min-h-[520px] overflow-hidden">
        <Image
          src="/images/heroes/quienes-somos.jpg"
          alt="Interior del restaurante Gunnen"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1
            className="text-white uppercase tracking-[0.18em]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}
          >
            Quiénes somos
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg leading-relaxed font-light">
            Gunnen es una palabra holandesa.<br />Significa <em>alegría compartida</em>.
          </p>
        </div>
      </section>

      {/* ── Filosofía — texto ancho ──────────────────────────────────── */}
      <section className="section-container">
        <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-gray-700 text-center">
          <p>
            Entendemos la cocina como el punto de encuentro entre quien se
            sienta a la mesa y quien cocina, como la experiencia que se crea a
            partir de productos, técnicas y sabores; charlas, encuentros y
            momentos compartidos.
          </p>
          <p>
            Nuestro pequeño comedor, apenas tres mesas, es un lugar para
            sentarse y disfrutar, para explorar nuevas posibilidades de las
            materias primas de nuestro entorno, pero también para ceder el
            protagonismo a los productores y a los artesanos que están detrás
            de nuestro trabajo y para disfrutar de la cocina con la
            sostenibilidad y el aprovechamiento integral siempre de fondo.
          </p>
        </div>
      </section>

      {/* ── El espacio — imagen derecha ──────────────────────────────── */}
      <section className="section-container bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5 text-lg leading-relaxed text-gray-700 order-2 md:order-1">
            <h2 className="text-3xl font-light tracking-wide">El espacio</h2>
            <p>
              Al igual que nuestros platos, nuestro restaurante trata de ser
              acogedor, honesto y reconocible. Este pequeño local es para
              nosotros más que un restaurante: es un lugar centrado en el
              producto y un refugio en el que dar rienda suelta a nuestro modo
              de entender la gastronomía.
            </p>
            <p>
              Es, también, nuestra forma de acoger, de dar la bienvenida a
              nuestro mundo y de ofrecer nuestro trabajo en un espacio que nos
              representa.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden order-1 md:order-2">
            <Image
              src="/images/experience/local-gunnen.jpeg"
              alt="El espacio de Gunnen"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Temporada y origen — imagen izquierda ────────────────────── */}
      <section className="section-container">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/experience/hortalizas.jpeg"
              alt="Producto de temporada Gunnen"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-gray-700">
            <h2 className="text-3xl font-light tracking-wide">Temporada y origen</h2>
            <p>
              El mercado manda. Nuestra cocina cambia con el año, evoluciona,
              explora la despensa y lo mejor que nuestros proveedores pueden
              ofrecernos en cada momento.
            </p>
            <p>
              Cada bocado busca ser un homenaje a los orígenes de la materia
              prima, a quien trabaja para hacernos llegar los mejores productos
              y a momentos que con frecuencia son efímeros —tal vez no más de
              unas pocas semanas al año— pero que nos permiten bucear en cada
              estación para ofrecer una propuesta efímera, viva y siempre en
              crecimiento.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mundo líquido — imagen derecha ──────────────────────────── */}
      <section className="section-container bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          <div className="space-y-5 text-lg leading-relaxed text-gray-700 order-2 md:order-1 flex flex-col justify-center">
            <h2 className="text-3xl font-light tracking-wide">Mundo líquido</h2>
            <p>
              Tratamos de que esta filosofía se traslade también al mundo
              líquido a través de una bodega seleccionada para encajar con
              nuestros platos y representar a proyectos y elaboradores con los
              que compartimos un modo de entender la gastronomía.
            </p>
            <p>
              Igualmente, trabajamos a diario en la elaboración de otras bebidas
              bajo la filosofía NOLO (No/Low Alcohol), tratando con ello de
              llevar la temporada y la oferta del mercado a la copa.
            </p>
          </div>
          <div className="relative order-1 md:order-2 min-h-[320px] sm:min-h-[400px] md:min-h-0 md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden">
            <Image
              src="/images/quienes-somos/nolo-gunnen.jpeg"
              alt="Bebida NOLO — filosofía No/Low Alcohol en Gunnen"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── El equipo ────────────────────────────────────────────────── */}
      <section className="section-container">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light tracking-wide text-center mb-12">
            El equipo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/team/equipo-gunnen.jpeg"
                  alt="Equipo Gunnen"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="group overflow-hidden">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/team/chef-gunnen.jpeg"
                  alt="Chef Gunnen"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Galería final — strip de platos ─────────────────────────── */}
      <section className="section-container bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { src: "/images/experience/mar.jpeg", alt: "Experiencia gastronómica de mar" },
            { src: "/images/experience/hortalizas.jpeg", alt: "Producto de temporada" },
            { src: "/images/menus/tempo.jpg", alt: "Menú Tempo" },
            { src: "/images/menus/impulso.jpg", alt: "Menú Impulso" },
          ].map(({ src, alt }) => (
            <div key={src} className="relative aspect-square overflow-hidden">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
