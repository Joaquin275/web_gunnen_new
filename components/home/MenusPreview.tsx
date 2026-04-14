import Link from "next/link";

const menus = [
  {
    name: "Tempo",
    slug: "tempo",
    description: "Nuestra invitación a entrar hasta la cocina, a olvidarte del reloj y de las prisas. Un recorrido más extenso por nuestra forma de entender la materia prima y el entorno.",
    price: "100€",
    image: "/images/menus/tempo.jpg",
  },
  {
    name: "Impulso",
    slug: "impulso",
    description: "Nuestra versión más inmediata, una propuesta que puede funcionar como puerta de entrada o si no dispones de mucho tiempo. Cocina ágil, estacional y de producto.",
    price: "80€",
    image: "/images/menus/impulso.jpg",
  },
];

export default function MenusPreview() {
  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-hero font-serif font-light mb-4">Nuestros menús</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cada propuesta es un relato gastronómico diseñado para sorprender
            y emocionar.
          </p>
        </div>

        {/* Grid de menús - Centrado con gap más grande */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-12 md:gap-16 mb-12 max-w-4xl mx-auto">
          {menus.map((menu, index) => (
            <Link
              key={menu.slug}
              href={`/menus/${menu.slug}`}
              className="group flex-1"
            >
              <article className="bg-white overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-gray-200 max-w-md">
                {/* Imagen del menú */}
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  <img 
                    src={menu.image} 
                    alt={menu.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>
                
                {/* Contenido */}
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-light mb-4 group-hover:text-accent transition-colors">
                    {menu.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {menu.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-2xl font-serif font-light">{menu.price}</span>
                    <span className="text-sm tracking-wider uppercase text-gray-500 group-hover:text-primary transition-colors">
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA - Oculto porque ya solo hay 2 menús */}
        {/* <div className="text-center">
          <Link href="/menus" className="btn-secondary">
            Ver todos los menús
          </Link>
        </div> */}
      </div>
    </section>
  );
}
