"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    const reservationId = searchParams.get("reservationId");
    if (!reservationId) { setStatus("error"); return; }

    fetch(`/api/reservations/${reservationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reservation) {
          setReservation(data.reservation);
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
          <h1 className="text-2xl font-serif font-light mb-2">Procesando su reserva...</h1>
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
              <h1 className="text-4xl font-serif font-light mb-4">Error en la reserva</h1>
              <p className="text-lg text-gray-600 mb-8">Ha ocurrido un error. Por favor, contacte con nosotros.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/reservas" className="btn-primary">Intentar de nuevo</Link>
                <Link href="/" className="btn-secondary">Volver al inicio</Link>
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

            <h1 className="text-4xl font-serif font-light mb-4">¡Reserva confirmada!</h1>
            <p className="text-lg text-gray-600 mb-12">
              Hemos recibido su reserva. Le esperamos con ilusión.
            </p>

            {reservation && (
              <div className="bg-gray-50 p-8 text-left mb-8">
                <h2 className="text-sm tracking-wider uppercase text-gray-600 mb-6">Detalles de su reserva</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Nombre</span>
                    <span className="font-semibold">{reservation.firstName} {reservation.lastName}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Fecha</span>
                    <span className="font-semibold">
                      {new Date(reservation.reservationDate + "T00:00:00").toLocaleDateString("es-ES", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Hora</span>
                    <span className="font-semibold">{reservation.reservationTime}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Comensales</span>
                    <span className="font-semibold">{reservation.numberOfPeople} personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold">{reservation.email}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8 text-sm text-left">
              <h3 className="font-semibold mb-2 text-amber-800">Pago en el restaurante</h3>
              <p className="text-amber-700">La señal y el resto del importe se abonarán directamente en el restaurante el día de su visita.</p>
            </div>

            <div className="bg-gray-50 p-6 mb-8 text-sm text-left">
              <h3 className="font-semibold mb-2">Política de cancelación</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Cancelación con más de 72h: sin penalización</li>
                <li>• Cancelación con menos de 48h: puede aplicarse cargo</li>
              </ul>
            </div>

            <Link href="/" className="btn-secondary w-full">Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
