"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoidButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleVoid = async () => {
    const confirmed = window.confirm(
      "¿Liberar la retención del 30%?\n\nEsto anulará la preautorización bancaria y devolverá el importe retenido al cliente.\n\nUsar cuando el cliente se ha presentado correctamente o ha cancelado dentro del plazo permitido."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/void`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al liberar la retención");
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
        Retención liberada ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleVoid}
      disabled={loading}
      className="text-sm bg-green-700 hover:bg-green-800 text-white px-4 py-2 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? "Procesando..." : "Liberar retención"}
    </button>
  );
}
