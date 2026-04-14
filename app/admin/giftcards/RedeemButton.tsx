"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RedeemButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!confirm("¿Marcar este bono como canjeado?")) return;
    setLoading(true);
    await fetch(`/api/admin/giftcards/${id}/redeem`, { method: "POST" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={handleRedeem} disabled={loading}
      className="mt-2 text-xs tracking-wider uppercase text-gray-500 hover:text-primary disabled:opacity-50">
      {loading ? "..." : "Marcar canjeado"}
    </button>
  );
}
