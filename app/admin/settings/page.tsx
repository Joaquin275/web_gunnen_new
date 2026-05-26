"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    restaurantName: "Gunnen",
    email: "reservas@gunnen.es",
    phone: "",
    address: "Juan Díaz Porlier, 15, A Coruña",
    depositMode: "percentage",
    depositValue: "30",
    cancelPolicy72h: "100",
    cancelPolicy48h: "0",
    cancelPolicy48_72h: "100",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setForm(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError("No se pudo guardar la configuración");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif font-light">Configuración</h1>
        <p className="text-gray-500 mt-1">Ajustes generales del restaurante</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="font-serif font-light text-lg border-b border-gray-100 pb-3">Datos del restaurante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Nombre</label>
              <input type="text" value={form.restaurantName} onChange={(e) => setForm((f) => ({ ...f, restaurantName: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Teléfono</label>
              <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+34 XXX XXX XXX"
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Dirección</label>
              <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="font-serif font-light text-lg border-b border-gray-100 pb-3">Señal / Depósito</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Modo de señal</label>
              <select value={form.depositMode} onChange={(e) => setForm((f) => ({ ...f, depositMode: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm">
                <option value="percentage">Porcentaje del total (%)</option>
                <option value="fixed">Importe fijo por persona (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">
                {form.depositMode === "percentage" ? "Porcentaje (%)" : "Importe por persona (€)"}
              </label>
              <input type="number" value={form.depositValue} onChange={(e) => setForm((f) => ({ ...f, depositValue: e.target.value }))}
                min={1} className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h2 className="font-serif font-light text-lg border-b border-gray-100 pb-3">Política de cancelación</h2>
          <p className="text-sm text-gray-500">% de reembolso aplicado según antelación de la cancelación</p>
          <div className="space-y-3">
            {[
              { label: "Cancelación con más de 72h de antelación", key: "cancelPolicy72h" },
              { label: "Cancelación entre 48h y 72h", key: "cancelPolicy48_72h" },
              { label: "Cancelación con menos de 48h de antelación", key: "cancelPolicy48h" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50">
                <label className="text-sm text-gray-600 flex-1">{item.label}</label>
                <div className="flex items-center gap-2 ml-4">
                  <input type="number" min={0} max={100}
                    value={form[item.key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [item.key]: e.target.value }))}
                    className="w-16 border border-gray-200 px-2 py-1 text-center focus:outline-none focus:border-primary text-sm" />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
          {saved && <p className="text-sm text-green-600">✓ Configuración guardada</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
}
