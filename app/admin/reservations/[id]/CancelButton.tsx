"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta reserva? Se marcará como CANCELADA.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al cancelar la reserva");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
    >
      {loading ? "Cancelando..." : "Cancelar reserva"}
    </button>
  );
}
