"use client";

import { useState, useEffect } from "react";

const heroImages = [
  "/images/experience/local-horizontal.jpeg",
  "/images/experience/local-horizontal-2.jpeg",
  "/images/experience/local-gunnen.jpeg",
  "/images/experience/interior-gunnen.jpg",
  "/images/experience/mar.jpeg",
  "/images/experience/hortalizas.jpeg",
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "160dvh", minHeight: "900px" }}
    >
      {/* Carrusel de fondo */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className="absolute inset-0"
            style={{
              opacity: index === currentImage ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          >
            <img
              src={image}
              alt={`Gunnen ${index + 1}`}
              className="w-full h-full object-cover"
              style={
                index === currentImage
                  ? { animation: "kenburns 20s ease-out infinite alternate" }
                  : {}
              }
            />
          </div>
        ))}
      </div>

      {/* Título arriba a la izquierda — igual que en la referencia */}
      <div className="absolute z-20 left-6 md:left-16" style={{ top: "38%" }}>
        <h1
          className="font-brefa text-white uppercase"
          style={{
            fontSize: "clamp(1.4rem, 4vw, 3.2rem)",
            fontWeight: 400,
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
            letterSpacing: "0.10em",
          }}
        >
          Alegría Compartida
        </h1>
      </div>

      {/* Caja de texto — justo debajo del título, izquierda */}
      <div
        className="absolute z-20 left-6 md:left-16"
        style={{ top: "47%", maxWidth: "min(680px, 90vw)" }}
      >
        <div
          className="p-4 md:p-8 text-xs md:text-sm leading-relaxed text-gray-800 space-y-2 md:space-y-3"
          style={{ background: "rgba(240,240,238,0.92)" }}
        >
          <p>
            Gunnen es una palabra holandesa. Significa alegría compartida y
            representa nuestra filosofía de trabajo. Entendemos la cocina como
            el punto de encuentro entre quien se sienta a la mesa y quien
            cocina, como la experiencia que se crea a partir de productos,
            técnicas y sabores; charlas, encuentros y momentos compartidos.
          </p>
          <p>
            Nuestro pequeño comedor, apenas tres mesas, es un lugar para
            sentarse y disfrutar, para explorar nuevas posibilidades de las
            materias primas de nuestro entorno, pero también para ceder el
            protagonismo a los productores y a los artesanos que están detrás
            de nuestro trabajo y para disfrutar de la cocina con la
            sostenibilidad y el aprovechamiento integral siempre de fondo.
          </p>
          <p>
            Tratamos de que esta filosofía se traslade también al mundo líquido
            a través de una bodega seleccionada para encajar con nuestros platos
            y representar a proyectos y elaboradores con los que compartimos un
            modo de entender la gastronomía. Igualmente, trabajamos a diario en
            la elaboración de otras bebidas bajo la filosofía NOLO (No/Low
            Alcohol), tratando con ello de llevar la temporada y la oferta del
            mercado a la copa.
          </p>
        </div>
      </div>

      {/* Dots de navegación — parte inferior central */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImage
                ? "bg-white w-8"
                : "bg-white/50 w-2 hover:bg-white/80"
            }`}
            aria-label={`Imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
