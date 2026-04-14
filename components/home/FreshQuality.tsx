"use client";

import { useState, useEffect } from "react";

export default function FreshQuality() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Imágenes del carrusel - Fotos reales del restaurante
  const images = [
    {
      id: 1,
      src: "/images/gallery/GUNNEN-039-BAJA-scaled.jpg",
      alt: "Interior del restaurante Gunnen",
      title: "Nuestro Espacio",
    },
    {
      id: 2,
      src: "/images/gallery/GUNNEN-042-BAJA-scaled.jpg",
      alt: "Ambiente íntimo de Gunnen",
      title: "Ambiente Acogedor",
    },
    {
      id: 3,
      src: "/images/gallery/Plato-con-trufa-GUNNEN-1.jpeg",
      alt: "Plato con trufa de Gunnen",
      title: "Trufa Premium",
    },
    {
      id: 4,
      src: "/images/gallery/Postre-ciruela-fermentada-GUNNEN-0.jpeg",
      alt: "Postre de ciruela fermentada",
      title: "Ciruela Fermentada",
    },
    {
      id: 5,
      src: "/images/gallery/1.Postre-de-caqui-jengibre-y-miel-Gunnen-1-1.jpeg",
      alt: "Postre de caqui, jengibre y miel",
      title: "Caqui y Miel",
    },
    {
      id: 6,
      src: "/images/gallery/GUNNEN-099-BAJA-scaled.jpg",
      alt: "Detalle del restaurante Gunnen",
      title: "Detalles Gunnen",
    },
  ];

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <h2 className="text-hero font-serif font-light mb-8 text-center">
          Platos que celebran la frescura y la calidad
        </h2>

        {/* Texto */}
        <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed text-gray-700 mb-16">
          <p>
            Seleccionamos cuidadosamente ingredientes de primera calidad, 
            frescos y de temporada, para que cada bocado sea una 
            celebración de lo mejor que la tierra y el mar tienen para 
            ofrecer. Nos enorgullece ofrecerte una cocina que está llena de 
            detalles que marcan la diferencia, donde el sabor puro y la atención a la 
            frescura se reflejan en cada creación culinaria.
          </p>
          <p className="text-center italic font-light">
            Aquí, el buen gusto no solo se siente, se vive.
          </p>
        </div>

        {/* Carrusel de imágenes */}
        <div className="relative max-w-5xl mx-auto">
          {/* Contenedor de imágenes */}
          <div className="relative overflow-hidden rounded-lg shadow-2xl aspect-[16/9] bg-gray-200">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {/* Título de la imagen */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                  <h3 className="text-2xl md:text-3xl font-serif font-light text-white text-center">
                    {image.title}
                  </h3>
                </div>
              </div>
            ))}

            {/* Botones de navegación */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow-lg z-10"
              aria-label="Anterior"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow-lg z-10"
              aria-label="Siguiente"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Dots de navegación */}
          <div className="flex justify-center gap-3 mt-8">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-accent w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
