"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");
    const reservationId = searchParams.get("reservationId");

    if (paymentIntent) {
      // Verificar estado del pago
      fetch(`/api/payments/verify?payment_intent=${paymentIntent}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReservation(data.reservation);
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => {
          setStatus("error");
        });
    } else if (reservationId) {
      // Buscar reserva directamente
      fetch(`/api/reservations/${reservationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reservation) {
            setReservation(data.reservation);
            setStatus(data.reservation.status === "CONFIRMED" ? "success" : "loading");
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
              <div className="text-5xl mb-6">⚠️</div>
              <h1 className="text-4xl font-serif font-light mb-4">Error en la reserva</h1>
              <p className="text-lg text-gray-600 mb-8">
                Ha ocurrido un error procesando su reserva. Por favor, contacte con nosotros.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/reservas" className="btn-primary">
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

            <h1 className="text-4xl font-serif font-light mb-4">¡Reserva confirmada!</h1>
            <p className="text-lg text-gray-600 mb-12">
              Hemos enviado la confirmación a su correo electrónico
            </p>

            {/* Detalles de la reserva */}
            {reservation && (
              <div className="bg-gray-50 p-8 text-left mb-8">
                <h2 className="text-sm tracking-wider uppercase text-gray-600 mb-6">
                  Detalles de su reserva
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Fecha</span>
                    <span className="font-semibold">
                      {new Date(reservation.reservationDate).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Hora</span>
                    <span className="font-semibold">{reservation.reservationTime}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Comensales</span>
                    <span className="font-semibold">{reservation.numberOfPeople}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Nombre</span>
                    <span className="font-semibold">
                      {reservation.firstName} {reservation.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold">{reservation.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Señal pagada</span>
                    <span className="font-semibold">{Number(reservation.depositAmount).toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-accent/10 p-6 mb-8 text-sm text-left">
              <h3 className="font-semibold mb-2">Política de cancelación</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Cancelación con más de 72h: reembolso del 100%</li>
                <li>• Cancelación con menos de 48h: sin reembolso</li>
                <li>• Entre 48h-72h: reembolso del 100%</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link href="/" className="btn-secondary flex-1">
                Volver al inicio
              </Link>
              {reservation && (
                <Link href={`/reservas/${reservation.id}`} className="btn-primary flex-1">
                  Ver mi reserva
                </Link>
              )}
            </div>
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
