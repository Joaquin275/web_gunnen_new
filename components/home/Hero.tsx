"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const heroImages = [
  "/images/hero/Carr1.jpg",
  "/images/hero/Carr2.jpg",
  "/images/hero/Carr2-2.jpg",
  "/images/hero/Carr2-3.jpg",
  "/images/hero/Carr4.jpg",
  "/images/hero/Carr5.jpg",
  "/images/hero/Carr6.jpg",
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
        style={{ top: "47%", maxWidth: "min(480px, 90vw)" }}
      >
        <div
          className="p-4 md:p-8 text-xs md:text-base leading-relaxed text-gray-800 space-y-2 md:space-y-3"
          style={{ background: "rgba(240,240,238,0.92)" }}
        >
          <p>
            En <strong>Gunnen</strong> compartimos la felicidad de tu
            experiencia y tratamos de retroalimentarla expandiéndola y
            haciéndola duradera más allá de tu visita a nuestro pequeño gran
            espacio gastronómico.
          </p>
          <p>
            Queremos compartir contigo la sabiduría que tomamos prestada para
            crecer: el origen, la tradición, la artesanía y la concienciación
            de trabajar por dejar un mundo mejor. Por ello, te invitamos a
            entrar en nuestra cocina de autor, comprometida con el producto
            fresco, local en su mayoría, de calidad y comprometida con el
            aprovechamiento alimentario, junto con una cuidada bodega que
            seleccionamos con clara presencia de Galicia sin dejar atrás las
            grandes zonas vinícolas españolas e internacionales.
          </p>
          <p className="italic font-medium pt-1">
            Difunde nuestra fórmula, multiplica alegría sin reservas.
          </p>

          {/* CTAs */}
          <div className="flex flex-row gap-3 pt-3">
            <Link href="/reservas" className="btn-primary text-center text-xs">
              Reservar mesa
            </Link>
            <Link
              href="/menus"
              className="btn-secondary text-center text-xs"
            >
              Ver menús
            </Link>
          </div>
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
