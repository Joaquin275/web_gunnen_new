import { Suspense } from "react";
import Link from "next/link";

function Content() {
  // Leer query params desde el servidor no es posible en App Router sin searchParams
  // Usamos un client component para leerlos
  return <ConfirmClient />;
}

export default function ConfirmarPage() {
  return (
    <Suspense>
      <ConfirmClient />
    </Suspense>
  );
}

// ── Client component ─────────────────────────────────────────────────────────
"use client";
import { useSearchParams } from "next/navigation";

function ConfirmClient() {
  const params = useSearchParams();
  const ok      = params.get("ok") === "1";
  const already = params.get("already") === "1";
  const error   = params.get("error");
  const name    = params.get("name") || "";
  const date    = params.get("date") || "";
  const time    = params.get("time") || "";

  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  if (ok || already) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-lg w-full p-10 md:p-14 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-light mb-3">
            {already ? "Ya confirmada" : "¡Asistencia confirmada!"}
          </h1>
          {already ? (
            <p className="text-gray-500 mb-8">
              {name ? `${name}, ya` : "Ya"} habías confirmado tu asistencia anteriormente. ¡Te esperamos!
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-2 text-lg">
                Gracias{name ? `, ${name}` : ""}. ¡Te esperamos!
              </p>
              {dateLabel && (
                <p className="text-gray-500 text-sm mb-8">
                  {dateLabel} a las {time}
                </p>
              )}
            </>
          )}
          <div className="bg-accent/10 border border-accent/30 p-5 mb-8 text-sm text-left space-y-1 text-gray-700">
            <p>📍 <strong>Juan Díaz Porlier 15</strong>, A Coruña (Matogrande)</p>
            <p>📞 <a href="tel:+34613739550" className="text-accent underline">613 739 550</a></p>
            <p>✉️ <a href="mailto:reservas@gunnen.es" className="text-accent underline">reservas@gunnen.es</a></p>
          </div>
          <Link href="/" className="btn-primary w-full block">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  // Error
  const errorMsg =
    error === "not_found" ? "No se encontró la reserva. Es posible que el enlace haya caducado." :
    error === "cancelled"  ? "Esta reserva ya no está activa." :
    error === "token_missing" ? "Enlace de confirmación inválido." :
    "Ha ocurrido un error. Contacta con nosotros en reservas@gunnen.es";

  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white max-w-lg w-full p-10 md:p-14 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif font-light mb-3">Algo no fue bien</h1>
        <p className="text-gray-500 mb-8">{errorMsg}</p>
        <a href="mailto:reservas@gunnen.es" className="btn-primary w-full block">
          Contactar con Gunnen
        </a>
      </div>
    </div>
  );
}
