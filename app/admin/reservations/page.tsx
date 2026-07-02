"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const HORARIOS = [
  "13:30", "13:45", "14:00",
  "20:30", "20:45", "21:00",
];

const MENUS = [
  "Menú TEMPO",
  "Menú TEMPO + Armonía con vino",
  "Menú TEMPO + Armonía No/Low",
  "Menú IMPULSO",
  "Menú IMPULSO + Armonía con vino",
  "Menú IMPULSO + Armonía No/Low",
];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "",
  reservationDate: "", reservationTime: "", numberOfPeople: 2,
  menuName: "", observations: "",
};

interface Reservation {
  id: string;
  reservationDate: string;
  reservationTime: string;
  firstName: string;
  lastName: string;
  email: string;
  numberOfPeople: number;
  menuName: string | null;
  depositAmount: number;
  status: string;
  redsysStatus: string | null;
  confirmedAt: string | null;
  attendanceConfirmedAt: string | null;
}

const PREAUTH_WARN_DAYS = 5;  // aviso a partir de 5 días
const PREAUTH_EXPIRY_DAYS = 7; // caduca a los 7 días

function preauthAgeInfo(r: Reservation): { days: number; warn: boolean; expired: boolean } | null {
  if (r.redsysStatus !== "PREAUTHORIZED" || !r.confirmedAt) return null;
  const days = Math.floor((Date.now() - new Date(r.confirmedAt).getTime()) / (24 * 60 * 60 * 1000));
  return { days, warn: days >= PREAUTH_WARN_DAYS, expired: days >= PREAUTH_EXPIRY_DAYS };
}

function statusLabel(status: string) {
  if (status === "CONFIRMED") return { label: "Confirmada", cls: "bg-green-100 text-green-700" };
  if (status === "CANCELLED") return { label: "Cancelada", cls: "bg-red-100 text-red-700" };
  return { label: "Pendiente pago", cls: "bg-amber-100 text-amber-700" };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Nueva reserva manual
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchReservations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/reservations-list");
      const json = await res.json();
      setReservations(json.reservations ?? []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  useEffect(() => {
    const id = setInterval(() => fetchReservations(true), 30_000);
    return () => clearInterval(id);
  }, [fetchReservations]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const res = await fetch("/api/admin/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchReservations(true);
    } else {
      const data = await res.json();
      setFormError(data.error || "Error al crear la reserva");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-light">Reservas</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${refreshing ? "bg-amber-400 animate-pulse" : "bg-green-500"}`} />
            <p className="text-gray-500 text-sm">
              {refreshing ? "Actualizando…" : lastUpdated
                ? `${reservations.length} reservas · actualizado ${lastUpdated.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : ""}
            </p>
            <button
              onClick={() => fetchReservations(true)}
              disabled={refreshing}
              title="Actualizar ahora"
              className="p-1 text-gray-400 hover:text-primary transition-colors disabled:opacity-40"
            >
              <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(""); }}
          className="btn-primary text-sm"
        >
          {showForm ? "Cancelar" : "+ Nueva reserva"}
        </button>
      </div>

      {/* ── Formulario reserva manual ── */}
      {showForm && (
        <form onSubmit={handleCreateReservation} className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="font-serif font-light text-xl border-b border-gray-100 pb-4">Nueva reserva manual</h2>
          <p className="text-sm text-gray-500">La reserva se creará directamente como <strong>Confirmada</strong>, sin pasar por pago.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Nombre *</label>
              <input required type="text" value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Apellidos *</label>
              <input required type="text" value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Email *</label>
              <input required type="email" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Teléfono</label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Fecha *</label>
              <input required type="date" value={form.reservationDate}
                onChange={(e) => setForm((f) => ({ ...f, reservationDate: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Hora *</label>
              <select required value={form.reservationTime}
                onChange={(e) => setForm((f) => ({ ...f, reservationTime: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="">Seleccionar hora</option>
                {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Personas *</label>
              <input required type="number" min={1} max={20} value={form.numberOfPeople}
                onChange={(e) => setForm((f) => ({ ...f, numberOfPeople: Number(e.target.value) }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Menú</label>
              <select value={form.menuName}
                onChange={(e) => setForm((f) => ({ ...f, menuName: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="">Sin especificar</option>
                {MENUS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Observaciones</label>
              <input type="text" value={form.observations}
                onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
                placeholder="Alergias, peticiones especiales..."
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Creando…" : "Crear reserva confirmada"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 overflow-hidden">
        {reservations.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-400">No hay reservas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-gray-500">Fecha / Hora</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-gray-500">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-gray-500">Menú</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Personas</th>
                  <th className="px-4 py-3 text-right text-xs tracking-wider uppercase text-gray-500">Retención</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Redsys</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Asistencia</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((r) => {
                  const { label, cls } = statusLabel(r.status);
                  const preauth = preauthAgeInfo(r);
                  const redsysCls =
                    preauth?.expired ? "text-orange-600 font-semibold" :
                    preauth?.warn ? "text-amber-600 font-semibold" :
                    r.redsysStatus === "PREAUTHORIZED" ? "text-blue-700" :
                    r.redsysStatus === "CAPTURED" ? "text-green-700" :
                    r.redsysStatus === "REJECTED" ? "text-red-600" :
                    r.redsysStatus === "PREAUTH_EXPIRED" ? "text-orange-500" : "text-gray-400";
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${preauth?.expired ? "bg-orange-50" : preauth?.warn ? "bg-amber-50" : ""}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium">
                          {new Date(r.reservationDate).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <span className="text-gray-400 ml-2">{r.reservationTime}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.firstName} {r.lastName}</p>
                        <p className="text-gray-400 text-xs">{r.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.menuName || "—"}</td>
                      <td className="px-4 py-3 text-center">{r.numberOfPeople}</td>
                      <td className="px-4 py-3 text-right font-medium">{Number(r.depositAmount).toFixed(2)}€</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 tracking-wider uppercase ${cls}`}>{label}</span>
                      </td>
                      <td className={`px-4 py-3 text-center text-xs font-medium ${redsysCls}`}>
                        {preauth?.expired
                          ? <span title={`${preauth.days} días — retención caducada`}>⚠️ CADUCADA ({preauth.days}d)</span>
                          : preauth?.warn
                            ? <span title={`${preauth.days} días — caduca pronto`}>⏳ {preauth.days}d</span>
                            : r.redsysStatus || "—"
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.status === "CONFIRMED" ? (
                          r.attendanceConfirmedAt ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700">
                              ✓ Confirmada
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Pendiente</span>
                          )
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/admin/reservations/${r.id}`} className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
