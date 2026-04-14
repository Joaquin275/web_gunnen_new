"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GiftCard {
  id: string; code: string; amount: number;
  buyerName: string; buyerEmail: string;
  recipientName: string; recipientEmail: string;
  message: string; status: string; sendDate: string;
  redeemedAt: string | null; createdAt: string;
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return { label: "Activo", cls: "bg-green-100 text-green-700" };
  if (status === "REDEEMED") return { label: "Canjeado", cls: "bg-gray-100 text-gray-500" };
  return { label: "Expirado", cls: "bg-red-100 text-red-700" };
}

const SUGGESTED_AMOUNTS = [50, 100, 150, 200];

export default function GiftCardsClient({ initialGiftCards }: { initialGiftCards: GiftCard[] }) {
  const router = useRouter();
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: 100,
    customAmount: "",
    useCustom: false,
    buyerName: "",
    buyerEmail: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
    sendDate: new Date().toISOString().split("T")[0],
  });

  const finalAmount = form.useCustom ? Number(form.customAmount) : form.amount;

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `GUNNEN-${seg(4)}-${seg(4)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 10) return alert("Importe mínimo: 10€");
    setSaving(true);
    const res = await fetch("/api/admin/giftcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: generateCode(),
        amount: finalAmount,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        recipientName: form.recipientName || form.buyerName,
        recipientEmail: form.recipientEmail || form.buyerEmail,
        message: form.message,
        sendDate: form.sendDate,
        status: "ACTIVE",
        redeemedAt: null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setGiftCards((g) => [created, ...g]);
      setShowForm(false);
      setForm({ amount: 100, customAmount: "", useCustom: false, buyerName: "", buyerEmail: "", recipientName: "", recipientEmail: "", message: "", sendDate: new Date().toISOString().split("T")[0] });
    } else {
      alert("Error al crear el bono");
    }
    setSaving(false);
  };

  const handleRedeem = async (id: string) => {
    if (!confirm("¿Marcar este bono como canjeado?")) return;
    const res = await fetch(`/api/admin/giftcards/${id}/redeem`, { method: "POST" });
    if (res.ok) setGiftCards((g) => g.map((x) => x.id === id ? { ...x, status: "REDEEMED", redeemedAt: new Date().toISOString() } : x));
  };

  const active = giftCards.filter((g) => g.status === "ACTIVE").length;
  const redeemed = giftCards.filter((g) => g.status === "REDEEMED").length;
  const totalValue = giftCards.filter((g) => g.status === "ACTIVE").reduce((s, g) => s + g.amount, 0);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">Bonos Regalo</h1>
          <p className="text-gray-500 mt-1">{active} activos · {redeemed} canjeados · {totalValue}€ pendiente de canjear</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancelar" : "+ Crear bono"}
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-6">
          <h2 className="font-serif font-light text-xl border-b border-gray-100 pb-4">Nuevo bono regalo</h2>

          {/* Importe */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">Importe *</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {SUGGESTED_AMOUNTS.map((a) => (
                <button
                  type="button" key={a}
                  onClick={() => setForm((f) => ({ ...f, amount: a, useCustom: false }))}
                  className={`px-5 py-2 text-sm border transition-colors ${
                    !form.useCustom && form.amount === a
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 hover:border-primary"
                  }`}
                >
                  {a}€
                </button>
              ))}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, useCustom: true }))}
                className={`px-5 py-2 text-sm border transition-colors ${
                  form.useCustom ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-primary"
                }`}
              >
                Otro importe
              </button>
            </div>
            {form.useCustom && (
              <div className="flex items-center gap-2">
                <input
                  type="number" min={10} value={form.customAmount}
                  onChange={(e) => setForm((f) => ({ ...f, customAmount: e.target.value }))}
                  placeholder="Ej: 75"
                  className="border border-gray-200 px-3 py-2 w-32 focus:outline-none focus:border-primary"
                />
                <span className="text-gray-500">€</span>
              </div>
            )}
          </div>

          {/* Datos en dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-400 mb-3">Comprador</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                  <input type="text" required value={form.buyerName}
                    onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email *</label>
                  <input type="email" required value={form.buyerEmail}
                    onChange={(e) => setForm((f) => ({ ...f, buyerEmail: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-wider uppercase text-gray-400 mb-3">Destinatario <span className="normal-case text-gray-300">(opcional si es para uno mismo)</span></p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input type="text" value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    placeholder="Si es diferente al comprador"
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.recipientEmail}
                    onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                    placeholder="Si es diferente al comprador"
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dedicatoria</label>
              <textarea value={form.message} rows={3}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Mensaje personalizado..."
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha de envío</label>
              <input type="date" value={form.sendDate}
                onChange={(e) => setForm((f) => ({ ...f, sendDate: e.target.value }))}
                className="border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
              <p className="text-xs text-gray-400 mt-2">El código se generará automáticamente</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Creando..." : `Crear bono de ${finalAmount || "—"}€`}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista de bonos */}
      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {giftCards.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-400">No hay bonos aún. Crea el primero.</p>
        ) : (
          giftCards.map((g) => {
            const { label, cls } = statusLabel(g.status);
            return (
              <div key={g.id} className="px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-mono font-medium tracking-wider text-sm">{g.code}</p>
                      <span className={`text-xs px-2 py-0.5 tracking-wider uppercase ${cls}`}>{label}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      De: <strong>{g.buyerName}</strong>
                      {g.recipientName !== g.buyerName && <> → Para: <strong>{g.recipientName}</strong> ({g.recipientEmail})</>}
                    </p>
                    {g.message && <p className="text-sm text-gray-400 italic mt-1">"{g.message}"</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Creado: {new Date(g.createdAt).toLocaleDateString("es-ES")}
                      {g.redeemedAt && ` · Canjeado: ${new Date(g.redeemedAt).toLocaleDateString("es-ES")}`}
                    </p>
                  </div>
                  <div className="text-right ml-6 flex-shrink-0">
                    <p className="text-2xl font-serif font-light">{g.amount}€</p>
                    {g.status === "ACTIVE" && (
                      <button onClick={() => handleRedeem(g.id)}
                        className="mt-2 text-xs tracking-wider uppercase text-gray-400 hover:text-primary transition-colors">
                        Marcar canjeado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
