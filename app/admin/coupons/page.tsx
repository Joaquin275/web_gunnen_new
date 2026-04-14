"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number;
  description: string; maxUses: number; usedCount: number;
  expiresAt: string; active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE" as "PERCENTAGE" | "FIXED", value: 10,
    description: "", maxUses: 50, expiresAt: "2026-12-31", active: true,
  });

  useEffect(() => {
    fetch("/api/admin/coupons").then((r) => r.json()).then(setCoupons);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, code: form.code.toUpperCase(), expiresAt: new Date(form.expiresAt).toISOString() }),
    });
    if (res.ok) {
      const newCoupon = await res.json();
      setCoupons((c) => [newCoupon, ...c]);
      setShowForm(false);
      setForm({ code: "", type: "PERCENTAGE", value: 10, description: "", maxUses: 50, expiresAt: "2026-12-31", active: true });
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) setCoupons((c) => c.map((x) => x.id === id ? { ...x, active: !active } : x));
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((c) => c.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">Cupones</h1>
          <p className="text-gray-500 mt-1">{coupons.filter((c) => c.active).length} activos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancelar" : "+ Nuevo cupón"}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="font-serif font-light text-xl mb-4">Nuevo cupón</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Código *</label>
              <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                required placeholder="BIENVENIDA10" className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary font-mono" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary">
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Fijo (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Valor *</label>
              <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                min={1} required className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Usos máximos</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))}
                min={1} className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Expira</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Descripción</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Guardando..." : "Crear cupón"}</button>
        </form>
      )}

      {/* Lista */}
      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {coupons.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-400">No hay cupones</p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-medium tracking-wider">{c.code}</span>
                  <span className={`text-xs px-2 py-0.5 ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {c.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {c.type === "PERCENTAGE" ? `${c.value}% dto.` : `${c.value}€ dto.`} ·{" "}
                  {c.usedCount}/{c.maxUses} usos · Expira: {new Date(c.expiresAt).toLocaleDateString("es-ES")}
                </p>
                {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => toggleActive(c.id, c.active)}
                  className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary">
                  {c.active ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => deleteCoupon(c.id)}
                  className="text-xs tracking-wider uppercase text-red-400 hover:text-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
