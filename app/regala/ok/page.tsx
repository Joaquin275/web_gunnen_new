import Link from "next/link";

export default async function RegalaOkPage({
  searchParams,
}: {
  searchParams: Promise<{ giftCardId?: string }>;
}) {
  const { giftCardId } = await searchParams;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-6">
        <div className="bg-white p-10 text-center shadow-sm">
          {/* Icono éxito */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Pago confirmado</p>
          <h1 className="text-3xl font-serif font-light mb-4">Bono regalo enviado</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            El pago se ha procesado correctamente. El bono regalo con el código único
            y el PDF adjunto será enviado al destinatario en la fecha indicada.
          </p>

          <div className="bg-gray-50 p-5 mb-8 text-sm text-left space-y-2">
            <p className="flex items-center gap-2 text-green-700">
              <span className="text-green-500">✓</span>
              Pago procesado por Redsys/Sabadell
            </p>
            <p className="flex items-center gap-2 text-green-700">
              <span className="text-green-500">✓</span>
              PDF del bono generado con código único
            </p>
            <p className="flex items-center gap-2 text-green-700">
              <span className="text-green-500">✓</span>
              Email enviado al destinatario y al comprador
            </p>
          </div>

          <p className="text-xs text-gray-400 mb-8">
            Si tienes dudas sobre tu bono, escríbenos a{" "}
            <a href="mailto:reservas@gunnen.es" className="text-primary underline">
              reservas@gunnen.es
            </a>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="btn-secondary flex-1 text-center">
              Volver al inicio
            </Link>
            <Link href="/reservas" className="btn-primary flex-1 text-center">
              Hacer una reserva
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
