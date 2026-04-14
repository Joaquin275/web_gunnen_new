"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function GiftCardConfirmacionPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [giftCard, setGiftCard] = useState<any>(null);

  useEffect(() => {
    const giftCardId = searchParams.get("giftCardId");
    const paymentIntent = searchParams.get("payment_intent");

    if (paymentIntent && giftCardId) {
      // Verificar estado del pago
      fetch(`/api/giftcards/verify?payment_intent=${paymentIntent}&giftCardId=${giftCardId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGiftCard(data.giftCard);
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => {
          setStatus("error");
        });
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
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
              <div className="text-5xl mb-6">⚠️</div>
              <h1 className="text-4xl font-serif font-light mb-4">Error en la compra</h1>
              <p className="text-lg text-gray-600 mb-8">
                Ha ocurrido un error procesando su bono regalo. Por favor, contacte con nosotros.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/regala" className="btn-primary">
                  Intentar de nuevo
                </Link>
                <Link href="/" className="btn-secondary">
                  Volver al inicio
                </Link>
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
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-serif font-light mb-4">¡Bono regalo creado!</h1>
            <p className="text-lg text-gray-600 mb-12">
              El bono será enviado al destinatario en la fecha seleccionada
            </p>

            {/* Detalles del bono */}
            {giftCard && (
              <div className="bg-accent/10 p-8 text-left mb-8 border-l-4 border-accent">
                <div className="text-center mb-6">
                  <div className="text-sm tracking-wider uppercase text-gray-600 mb-2">
                    Código del bono
                  </div>
                  <div className="text-3xl font-mono font-bold tracking-wider text-primary">
                    {giftCard.code}
                  </div>
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
                  <div className="flex justify-between pb-3 border-b border-accent/20">
                    <span className="text-gray-600">Fecha de envío</span>
                    <span className="font-semibold">
                      {new Date(giftCard.sendDate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Válido hasta</span>
                    <span className="font-semibold">
                      {new Date(giftCard.expiresAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-6 mb-8 text-sm text-left">
              <h3 className="font-semibold mb-3">Información importante</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Hemos enviado una copia del bono a tu email</li>
                <li>• El destinatario lo recibirá en la fecha seleccionada</li>
                <li>• El bono es válido durante 12 meses desde su emisión</li>
                <li>• Se puede canjear al hacer una reserva introduciendo el código</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link href="/" className="btn-secondary flex-1">
                Volver al inicio
              </Link>
              <Link href="/regala" className="btn-primary flex-1">
                Comprar otro bono
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
