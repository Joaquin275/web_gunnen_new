import Link from "next/link";

export default async function RegalaKoPage({
  searchParams,
}: {
  searchParams: Promise<{ giftCardId?: string }>;
}) {
  await searchParams;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-6">
        <div className="bg-white p-10 text-center shadow-sm">
          {/* Icono error */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Pago no completado</p>
          <h1 className="text-3xl font-serif font-light mb-4">El bono no se ha procesado</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            El pago del bono regalo no se ha podido completar. No se ha realizado ningún cargo.
            Puedes intentarlo de nuevo o contactarnos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/regala" className="btn-primary flex-1 text-center">
              Intentar de nuevo
            </Link>
            <a
              href="https://wa.me/34613739550"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 text-center"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
