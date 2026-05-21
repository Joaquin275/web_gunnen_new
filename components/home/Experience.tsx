import Image from "next/image";

const steps = [
  {
    label: "Reservas",
    image: "/images/gallery/GUNNEN-039-BAJA-scaled.jpg",
    alt: "Interior del restaurante Gunnen",
  },
  {
    label: "Compramos",
    image: "/images/hero/Carr5.jpg",
    alt: "Producto de temporada Gunnen",
  },
  {
    label: "Elaboramos",
    image: "/images/team/Equipo-Gunnen-2.jpeg",
    alt: "Equipo elaborando en cocina",
  },
  {
    label: "Disfrutas",
    image: "/images/gallery/Plato-con-trufa-GUNNEN-1.jpeg",
    alt: "Plato final Gunnen",
  },
];

export default function Experience() {
  return (
    <section className="section-container bg-background">
      <div className="max-w-6xl mx-auto">

        {/* Título y texto */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-hero font-serif font-light mb-6">El espacio</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            Al igual que nuestros platos, nuestro restaurante trata de ser
            acogedor, honesto y reconocible. Este pequeño local es para
            nosotros más que un restaurante: es un lugar centrado en el
            producto y un refugio en el que dar rienda suelta a nuestro modo
            de entender la gastronomía. Es, también, nuestra forma de
            acoger, de dar la bienvenida a nuestro mundo y de ofrecer
            nuestro trabajo en un espacio que nos representa.
          </p>
        </div>

        {/* Strip de 4 paneles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5 -mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16">
          {steps.map((step, i) => (
            <div key={step.label} className="relative group overflow-hidden">
              {/* Imagen */}
              <div className="relative aspect-[2/3] md:aspect-[3/4]">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>

              {/* Etiqueta + conector */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <span
                  className="text-white uppercase tracking-widest text-sm font-light"
                  style={{ fontWeight: 300 }}
                >
                  {step.label}
                </span>
                {/* Número de paso */}
                <span className="text-white/40 text-xs tracking-wider">
                  0{i + 1}
                </span>
              </div>

              {/* Línea conectora entre paneles (solo en md+, no en el último) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-px z-10 w-0.5 h-12 -translate-y-1/2 bg-white/30" />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
