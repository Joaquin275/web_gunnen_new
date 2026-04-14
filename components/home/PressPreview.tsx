import Link from "next/link";

// Datos de ejemplo - estos vendrán de la DB
const pressItems = [
  {
    id: "1",
    slug: "apertura-gunnen-nueva-propuesta",
    title: "Gunnen inaugura una nueva era en la alta cocina",
    excerpt: "El nuevo restaurante promete revolucionar el panorama gastronómico con su propuesta única.",
    publishedAt: "2024-01-15",
  },
  {
    id: "2",
    slug: "reconocimiento-internacional",
    title: "Reconocimiento internacional a nuestra propuesta",
    excerpt: "Medios especializados destacan nuestra visión innovadora de la gastronomía contemporánea.",
    publishedAt: "2024-02-20",
  },
  {
    id: "3",
    slug: "producto-local-excelencia",
    title: "Compromiso con el producto local de excelencia",
    excerpt: "Colaboramos con más de 30 productores locales para garantizar la máxima calidad.",
    publishedAt: "2024-03-10",
  },
];

export default function PressPreview() {
  return (
    <section className="section-container bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-hero font-serif font-light mb-2">Prensa</h2>
            <p className="text-gray-600">Últimas noticias y menciones</p>
          </div>
          <Link
            href="/prensa"
            className="text-sm tracking-wider uppercase text-gray-600 hover:text-primary transition-colors link-subtle hidden md:inline-block"
          >
            Ver todo
          </Link>
        </div>

        {/* Grid de artículos */}
        <div className="space-y-8">
          {pressItems.map((item, index) => (
            <article key={item.id}>
              <Link href={`/prensa/${item.slug}`} className="group block">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-8 transition-all duration-300 hover:bg-gray-50/50">
                  <div className="md:col-span-2 flex items-center">
                    <time className="text-sm tracking-wider uppercase text-gray-400">
                      {new Date(item.publishedAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="md:col-span-10">
                    <h3 className="text-2xl font-serif font-light mb-3 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.excerpt}</p>
                  </div>
                </div>
              </Link>
              {index < pressItems.length - 1 && <div className="divider" />}
            </article>
          ))}
        </div>

        {/* CTA mobile */}
        <div className="text-center mt-12 md:hidden">
          <Link href="/prensa" className="btn-secondary">
            Ver todas las noticias
          </Link>
        </div>
      </div>
    </section>
  );
}
