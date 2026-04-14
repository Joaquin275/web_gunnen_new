import { reservationsDb } from "@/lib/db-json";
import Link from "next/link";

function statusLabel(status: string) {
  if (status === "CONFIRMED") return { label: "Confirmada", cls: "bg-green-100 text-green-700" };
  if (status === "CANCELLED") return { label: "Cancelada", cls: "bg-red-100 text-red-700" };
  return { label: "Pendiente pago", cls: "bg-amber-100 text-amber-700" };
}

export default function AdminReservationsPage() {
  const reservations = reservationsDb.findAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">Reservas</h1>
          <p className="text-gray-500 mt-1">{reservations.length} reservas en total</p>
        </div>
      </div>

      {/* Tabla */}
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
                  <th className="px-4 py-3 text-right text-xs tracking-wider uppercase text-gray-500">Señal</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((r) => {
                  const { label, cls } = statusLabel(r.status);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium">{r.date}</span>
                        <span className="text-gray-400 ml-2">{r.time}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.firstName} {r.lastName}</p>
                        <p className="text-gray-400 text-xs">{r.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.menuName}</td>
                      <td className="px-4 py-3 text-center">{r.people}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.depositAmount.toFixed(2)}€</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 tracking-wider uppercase ${cls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/admin/reservations/${r.id}`}
                          className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary"
                        >
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
