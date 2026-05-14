"use client";

/**
 * /reservas/ok — UrlOK de Redsys
 *
 * Redsys redirige aquí tras una preautorización correcta.
 * La confirmación real viene por MerchantURL (/api/redsys/notify).
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ReservaOkContent() {
  const searchParams = useSearchParams();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reservationId = searchParams.get("reservationId");
    if (!reservationId) { setLoading(false); return; }

    fetch(`/api/reservations/${reservationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reservation) setReservation(data.reservation);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-10 md:p-12 text-center">
            {/* Icono éxito */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-serif font-light mb-3">
              ¡Reserva confirmada!
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Su reserva ha sido confirmada con éxito.
            </p>

            {/* Detalles */}
            {reservation && (
              <div className="bg-gray-50 p-8 text-left mb-8">
                <h2 className="text-xs tracking-wider uppercase text-gray-500 mb-5">
                  Detalles
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-500">Nombre</span>
                    <span className="font-medium">
                      {reservation.firstName} {reservation.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-medium">
                      {new Date(reservation.reservationDate).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-500">Hora</span>
                    <span className="font-medium">
                      {reservation.reservationTime}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-500">Comensales</span>
                    <span className="font-medium">
                      {reservation.numberOfPeople} personas
                    </span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-500">Menú</span>
                    <span className="font-medium">
                      {reservation.menuName || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Retención bancaria</span>
                    <span className="font-medium text-green-700">
                      {reservation.depositAmount?.toFixed(2)}€ (30%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Aviso retención */}
            <div className="bg-blue-50 border border-blue-200 p-5 mb-8 text-sm text-left">
              <p className="font-semibold text-blue-900 mb-1">
                Sobre su garantía
              </p>
              <ul className="space-y-1 text-blue-800">
                <li>
                  ✓ Se ha retenido el 30% en su tarjeta como garantía.
                </li>
                <li>
                  ✓ Si acude a su reserva, la retención se libera sin cargo.
                </li>
                <li>
                  ✓ Cancelación gratuita con más de 24 horas de antelación.
                </li>
                <li>
                  ✗ Cancelación inferior a 24 horas: puede aplicarse el cargo.
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Le hemos enviado un email de confirmación a{" "}
              <strong>{reservation?.email}</strong>
            </p>

            <Link href="/" className="btn-primary w-full">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservaOkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReservaOkContent />
    </Suspense>
  );
}
