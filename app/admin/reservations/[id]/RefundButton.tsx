"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefundButton({ id, amount }: { id: string; amount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRefund = async () => {
    const confirmed = window.confirm(
      `¿Devolver el cobro de ${amount.toFixed(2)}€ al cliente?\n\nEsto enviará una devolución bancaria automática a la tarjeta del cliente.\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al procesar la devolución");
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
      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-2">
        Devolución realizada ✓
      </span>
    );
  }

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="text-sm bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? "Procesando..." : `Devolver ${amount.toFixed(2)}€`}
    </button>
  );
}
