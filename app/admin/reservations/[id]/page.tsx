import { reservationsDb } from "@/lib/db-json";
import Link from "next/link";
import { notFound } from "next/navigation";
import CancelButton from "./CancelButton";

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  const r = reservationsDb.findById(params.id);
  if (!r) notFound();

  const statusMap: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: "Confirmada", cls: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelada", cls: "bg-red-100 text-red-700" },
    PENDING_PAYMENT: { label: "Pendiente de pago", cls: "bg-amber-100 text-amber-700" },
  };
  const { label, cls } = statusMap[r.status] ?? { label: r.status, cls: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/reservations" className="text-xs tracking-wider uppercase text-gray-400 hover:text-primary">
          ← Volver
        </Link>
        <span className={`text-xs px-2 py-1 tracking-wider uppercase ${cls}`}>{label}</span>
      </div>

      <h1 className="text-3xl font-serif font-light">Reserva #{r.id.slice(-6).toUpperCase()}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div className="bg-white border border-gray-200 p-6 space-y-3">
          <h2 className="text-xs tracking-wider uppercase text-gray-500 mb-4">Cliente</h2>
          <div>
            <p className="text-xs text-gray-400">Nombre</p>
            <p className="font-medium">{r.firstName} {r.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p>{r.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Teléfono</p>
            <p>{r.phone}</p>
          </div>
        </div>

        {/* Reserva */}
        <div className="bg-white border border-gray-200 p-6 space-y-3">
          <h2 className="text-xs tracking-wider uppercase text-gray-500 mb-4">Detalles</h2>
          <div>
            <p className="text-xs text-gray-400">Fecha y hora</p>
            <p className="font-medium">{r.date} · {r.time}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Personas</p>
            <p>{r.people}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Menú</p>
            <p>{r.menuName} · {r.menuPrice}€/persona</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Señal pagada</p>
            <p className="font-medium text-green-700">{r.depositAmount.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Resta pagar en local</p>
            <p className="font-medium">{((r.menuPrice * r.people) - r.depositAmount).toFixed(2)}€</p>
          </div>
        </div>

        {/* Alérgenos y observaciones */}
        <div className="bg-white border border-gray-200 p-6 space-y-3 md:col-span-2">
          <h2 className="text-xs tracking-wider uppercase text-gray-500 mb-4">Notas</h2>
          <div>
            <p className="text-xs text-gray-400">Alérgenos declarados</p>
            <p>{r.allergens.length > 0 ? r.allergens.join(", ") : "Ninguno"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Observaciones</p>
            <p>{r.observations || "—"}</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      {r.status !== "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-red-800">Cancelar reserva</p>
            <p className="text-sm text-red-600">La reserva quedará marcada como cancelada</p>
          </div>
          <CancelButton id={r.id} />
        </div>
      )}
    </div>
  );
}
