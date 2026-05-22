"use client";

import { useState, useEffect } from "react";

const images = [
  {
    id: 1,
    src: "/images/experience/interior-gunnen.jpg",
    alt: "Interior del restaurante Gunnen",
  },
  {
    id: 2,
    src: "/images/experience/local-gunnen.jpg",
    alt: "Local Gunnen",
  },
  {
    id: 3,
    src: "/images/experience/hortalizas.jpg",
    alt: "Producto de temporada",
  },
  {
    id: 4,
    src: "/images/experience/mar.jpg",
    alt: "Experiencia gastronómica de mar",
  },
  {
    id: 5,
    src: "/images/menus/tempo.jpg",
    alt: "Menú Tempo",
  },
  {
    id: 6,
    src: "/images/menus/impulso.jpg",
    alt: "Menú Impulso",
  },
];

export default function FreshQuality() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play continuo, sin pausas por interacción
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <h2 className="text-hero font-serif font-light mb-8 text-center">
          Temporada y origen
        </h2>

        {/* Texto */}
        <div className="max-w-4xl mx-auto text-lg leading-relaxed text-gray-700 mb-12">
          <p>
            El mercado manda. Nuestra cocina cambia con el año, evoluciona,
            explora la despensa y lo mejor que nuestros proveedores pueden
            ofrecernos en cada momento. Cada bocado busca ser un homenaje a los
            orígenes de la materia prima, a quien trabaja para hacernos llegar
            los mejores productos y a momentos que con frecuencia son efímeros
            —tal vez no más de unas pocas semanas al año— pero que nos permiten
            bucear en cada estación para ofrecer una propuesta efímera, viva y
            siempre en crecimiento.
          </p>
        </div>

        {/* Carrusel ancho — casi borde a borde */}
        <div className="-mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16">
          <div className="relative overflow-hidden aspect-[16/7] md:aspect-[16/8] lg:aspect-[16/9] bg-gray-200">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: index === currentIndex ? 1 : 0 }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Dots sobre la imagen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-white w-6"
                      : "bg-white/50 w-1.5 hover:bg-white/80"
                  }`}
                  aria-label={`Imagen ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
