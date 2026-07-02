"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkExpiredButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleMark = async () => {
    const confirmed = window.confirm(
      "¿Marcar esta retención como caducada?\n\nConfirmas que la preautorización lleva más de 7 días y Redsys ya no puede operarla. El banco habrá liberado la retención automáticamente.\n\nEsta acción solo actualiza el estado en el panel — no realiza ninguna llamada a Redsys."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/mark-expired`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al actualizar el estado");
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
      <span className="text-xs bg-orange-100 text-orange-700 px-3 py-2">
        Marcada como caducada ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 transition-colors disabled:opacity-50"
    >
      {loading ? "Actualizando..." : "Marcar retención como caducada"}
    </button>
  );
}
