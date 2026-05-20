import Link from "next/link";

export default function GiftCardBanner() {
  return (
    <section className="section-container bg-accent text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-hero font-serif font-light mb-6">
          Regala una experiencia inolvidable
        </h2>
        <p className="text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl mx-auto opacity-90">
          Nuestros bonos regalo son la forma perfecta de compartir momentos únicos.
          Válidos durante 6 meses y personalizables con tu mensaje.
        </p>
        <Link href="/regala" className="btn-primary bg-white text-accent hover:bg-gray-100">
          Comprar bono regalo
        </Link>
      </div>
    </section>
  );
}
