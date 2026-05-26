"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
  attendanceConfirmedAt: string | null;
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
      </div>

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
                  const redsysCls =
                    r.redsysStatus === "PREAUTHORIZED" ? "text-blue-700" :
                    r.redsysStatus === "CAPTURED" ? "text-green-700" :
                    r.redsysStatus === "REJECTED" ? "text-red-600" : "text-gray-400";
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
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
                        {r.redsysStatus || "—"}
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
