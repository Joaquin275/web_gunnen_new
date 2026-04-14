"use client";

import { useState, useEffect } from "react";

interface Table {
  id: string; name: string; capacity: number;
  available: boolean; notes: string; createdAt: string;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", capacity: 8, available: true, notes: "" });

  useEffect(() => {
    fetch("/api/admin/tables")
      .then((r) => r.json())
      .then((d) => { setTables(d); setLoading(false); });
  }, []);

  const resetForm = () => {
    setForm({ name: "", capacity: 8, available: true, notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (t: Table) => {
    setForm({ name: t.name, capacity: t.capacity, available: t.available, notes: t.notes });
    setEditingId(t.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      const res = await fetch(`/api/admin/tables/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setTables((ts) => ts.map((t) => t.id === editingId ? updated : t));
        resetForm();
      }
    } else {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        setTables((ts) => [...ts, created]);
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleToggle = async (t: Table) => {
    const res = await fetch(`/api/admin/tables/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !t.available }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTables((ts) => ts.map((x) => x.id === t.id ? updated : x));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la mesa "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    if (res.ok) setTables((ts) => ts.filter((t) => t.id !== id));
  };

  const available = tables.filter((t) => t.available).length;
  const totalCapacity = tables.filter((t) => t.available).reduce((s, t) => s + t.capacity, 0);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">Mesas</h1>
          <p className="text-gray-500 mt-1">
            {tables.length} mesa{tables.length !== 1 ? "s" : ""} en total ·{" "}
            {available} disponible{available !== 1 ? "s" : ""} ·{" "}
            {totalCapacity} comensales max
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          + Añadir mesa
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="font-serif font-light text-xl border-b border-gray-100 pb-4">
            {editingId ? "Editar mesa" : "Nueva mesa"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Nombre *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Gunnen 4"
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Capacidad (personas) *</label>
              <input
                type="number" required min={1} max={30} value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Notas internas</label>
              <input
                type="text" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ej: Mesa junto a la ventana, zona reservada..."
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="available" checked={form.available}
                onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="available" className="text-sm text-gray-700">
                Disponible para reservas
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear mesa"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista de mesas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tables.map((t) => (
            <div key={t.id} className={`bg-white border p-6 transition-all ${t.available ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              {/* Cabecera tarjeta */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif font-light">{t.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Hasta {t.capacity} personas</p>
                </div>
                <span className={`text-xs px-2 py-1 tracking-wider uppercase ${t.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {t.available ? "Disponible" : "No disponible"}
                </span>
              </div>

              {/* Notas */}
              {t.notes && (
                <p className="text-sm text-gray-500 italic mb-4 border-l-2 border-gray-200 pl-3">
                  {t.notes}
                </p>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleToggle(t)}
                  className={`text-xs tracking-wider uppercase transition-colors ${
                    t.available ? "text-gray-500 hover:text-red-600" : "text-gray-400 hover:text-green-600"
                  }`}
                >
                  {t.available ? "Desactivar" : "Activar"}
                </button>
                <span className="text-gray-200">|</span>
                <button onClick={() => handleEdit(t)}
                  className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary transition-colors">
                  Editar
                </button>
                <span className="text-gray-200">|</span>
                <button onClick={() => handleDelete(t.id, t.name)}
                  className="text-xs tracking-wider uppercase text-gray-500 hover:text-red-600 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 border border-gray-100 p-4 text-sm text-gray-500">
        Las mesas desactivadas no aparecerán en el sistema de reservas. Puedes añadir nuevas mesas cuando amplíes el restaurante.
      </div>
    </div>
  );
}
