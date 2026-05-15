"use client";

/**
 * /reservas/ko — UrlKO de Redsys
 * Redsys redirige aquí si el pago fue rechazado o cancelado por el usuario.
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ReservaKoContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId");

  useEffect(() => {
    // Si tenemos reservationId, ya fue marcada como CANCELLED en el notify
    if (reservationId) {
      console.log("Reserva rechazada:", reservationId);
    }
  }, [reservationId]);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-10 md:p-12 text-center">
            {/* Icono error */}
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-serif font-light mb-3">
              Pago no completado
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              La autorización bancaria no pudo completarse. No se ha realizado
              ningún cargo ni retención en su tarjeta.
            </p>

            <div className="bg-gray-50 p-6 mb-8 text-sm text-left">
              <h3 className="font-semibold mb-3">Posibles motivos</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Pago cancelado por el usuario</li>
                <li>• Tarjeta rechazada por el banco</li>
                <li>• Error en la autenticación 3D Secure</li>
                <li>• Fondos insuficientes</li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Puede intentarlo de nuevo o contactar con nosotros en{" "}
              <a
                href="mailto:reservas@gunnen.es"
                className="text-primary hover:underline"
              >
                reservas@gunnen.es
              </a>{" "}
              o por WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/reservas" className="btn-primary flex-1">
                Intentar de nuevo
              </Link>
              <Link href="/" className="btn-secondary flex-1">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservaKoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReservaKoContent />
    </Suspense>
  );
}
