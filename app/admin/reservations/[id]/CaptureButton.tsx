"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CaptureButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleCapture = async () => {
    const confirmed = window.confirm(
      "¿Confirmas el cobro de la garantía (30%)?\n\nEsto confirmará la preautorización Redsys y realizará el cobro efectivo en la tarjeta del cliente.\n\nUsar solo si el cliente no se presentó o canceló fuera de plazo."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/capture`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al confirmar la preautorización");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-3 py-2">
        Cobro confirmado ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleCapture}
      disabled={loading}
      className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? "Procesando..." : "Cobrar garantía"}
    </button>
  );
}
