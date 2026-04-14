"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function GiftCardConfirmacionContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [giftCard, setGiftCard] = useState<any>(null);

  useEffect(() => {
    const giftCardId = searchParams.get("giftCardId");
    if (!giftCardId) { setStatus("error"); return; }

    fetch(`/api/admin/giftcards?id=${giftCardId}`)
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data) ? data.find((g: any) => g.id === giftCardId) : null;
        if (found) {
          setGiftCard(found);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6" />
          <h1 className="text-2xl font-serif font-light mb-2">Procesando su bono regalo...</h1>
          <p className="text-gray-600">Por favor, espere un momento</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-12">
              <h1 className="text-4xl font-serif font-light mb-4">Solicitud recibida</h1>
              <p className="text-lg text-gray-600 mb-8">
                Su solicitud de bono regalo ha sido recibida. Le contactaremos en breve con los detalles de pago.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/" className="btn-secondary">Volver al inicio</Link>
                <Link href="/regala" className="btn-primary">Comprar otro bono</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-serif font-light mb-4">¡Solicitud recibida!</h1>
            <p className="text-lg text-gray-600 mb-12">
              Le contactaremos con las instrucciones de pago para activar el bono.
            </p>

            {giftCard && (
              <div className="bg-accent/10 p-8 text-left mb-8 border-l-4 border-accent">
                <div className="text-center mb-6">
                  <div className="text-sm tracking-wider uppercase text-gray-600 mb-2">Código del bono (pendiente de pago)</div>
                  <div className="text-3xl font-mono font-bold tracking-wider text-primary">{giftCard.code}</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-3 border-b border-accent/20">
                    <span className="text-gray-600">Importe</span>
                    <span className="font-semibold">{Number(giftCard.amount).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-accent/20">
                    <span className="text-gray-600">Destinatario</span>
                    <span className="font-semibold">{giftCard.recipientEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de envío</span>
                    <span className="font-semibold">
                      {new Date(giftCard.sendDate).toLocaleDateString("es-ES", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8 text-sm text-left">
              <h3 className="font-semibold mb-2 text-amber-800">Próximos pasos</h3>
              <ul className="space-y-1 text-amber-700">
                <li>• Recibirás un email con las instrucciones de pago</li>
                <li>• Una vez confirmado el pago, activaremos el bono</li>
                <li>• El destinatario lo recibirá en la fecha seleccionada</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link href="/" className="btn-secondary flex-1">Volver al inicio</Link>
              <Link href="/regala" className="btn-primary flex-1">Comprar otro bono</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GiftCardConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <GiftCardConfirmacionContent />
    </Suspense>
  );
}
