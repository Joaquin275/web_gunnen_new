import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CancelButton from "./CancelButton";
import CaptureButton from "./CaptureButton";
import VoidButton from "./VoidButton";
import RefundButton from "./RefundButton";

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) notFound();

  const statusMap: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: "Confirmada", cls: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelada", cls: "bg-red-100 text-red-700" },
    PENDING_PAYMENT: { label: "Pendiente de pago", cls: "bg-amber-100 text-amber-700" },
  };
  const redsysStatusMap: Record<string, { label: string; cls: string }> = {
    NONE: { label: "Sin pago Redsys", cls: "bg-gray-100 text-gray-500" },
    PENDING: { label: "Enviado al TPV", cls: "bg-yellow-100 text-yellow-700" },
    PREAUTHORIZED: { label: "Retenido (30%)", cls: "bg-blue-100 text-blue-700" },
    CAPTURED: { label: "Cobrado", cls: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rechazado", cls: "bg-red-100 text-red-700" },
    REFUNDED: { label: "Liberado", cls: "bg-gray-100 text-gray-500" },
    GIFT_CARD: { label: "Bono regalo", cls: "bg-purple-100 text-purple-700" },
  };

  const { label, cls } = statusMap[r.status] ?? { label: r.status, cls: "bg-gray-100 text-gray-700" };
  const redsysStatusKey = (r.redsysStatus as string) || "NONE";
  const redsysStatusInfo = redsysStatusMap[redsysStatusKey] ?? { label: redsysStatusKey, cls: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/reservations" className="text-xs tracking-wider uppercase text-gray-400 hover:text-primary">
          ← Volver
        </Link>
        <span className={`text-xs px-2 py-1 tracking-wider uppercase ${cls}`}>{label}</span>
        <span className={`text-xs px-2 py-1 tracking-wider uppercase ${redsysStatusInfo.cls}`}>
          Redsys: {redsysStatusInfo.label}
        </span>
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
            <p className="font-medium">
              {new Date(r.reservationDate).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })} · {r.reservationTime}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Personas</p>
            <p>{r.numberOfPeople}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Menú</p>
            <p>{r.menuName || "—"} {r.menuPrice ? `· ${r.menuPrice}€/persona` : ""}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total estimado</p>
            <p className="font-medium">{Number(r.estimatedTotal).toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Retención Redsys (30%)</p>
            <p className="font-medium text-blue-700">{Number(r.depositAmount).toFixed(2)}€</p>
          </div>
        </div>

        {/* Info Redsys */}
        {r.redsysOrder && (
          <div className="bg-white border border-gray-200 p-6 space-y-3 md:col-span-2">
            <h2 className="text-xs tracking-wider uppercase text-gray-500 mb-4">TPV Virtual Redsys</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Ds_Order</p>
                <p className="font-mono font-medium">{r.redsysOrder}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estado TPV</p>
                <p className={`font-medium ${redsysStatusInfo.cls} inline-block px-2 py-0.5 text-xs`}>
                  {redsysStatusInfo.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Código autorización</p>
                <p className="font-mono">{r.redsysAuthCode || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ds_Response</p>
                <p className="font-mono">{r.redsysResponse || "—"}</p>
              </div>
            </div>
            {r.redsysCapturedAt && (
              <div>
                <p className="text-xs text-gray-400">Capturado el</p>
                <p>{r.redsysCapturedAt.toLocaleString("es-ES")}</p>
              </div>
            )}
          </div>
        )}

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

      {/* ── Acciones Redsys ──────────────────────────────────────── */}

      {/* Type 2: Cobrar garantía — preautorización activa, cliente no se presentó */}
      {redsysStatusKey === "PREAUTHORIZED" && Number(r.depositAmount) > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-900">
              Cobrar garantía · Type 2 (no-show / cancelación tardía)
            </p>
            <p className="text-sm text-amber-800">
              Confirma la preautorización y cobra el 30% retenido ({Number(r.depositAmount).toFixed(2)}€).
              Úsalo <strong>solo</strong> si el cliente no se presentó o canceló fuera de plazo.
            </p>
          </div>
          <CaptureButton id={id} />
        </div>
      )}

      {/* Type 9: Liberar retención — preautorización activa, cliente se presentó o canceló en plazo */}
      {redsysStatusKey === "PREAUTHORIZED" && Number(r.depositAmount) > 0 && (
        <div className="bg-green-50 border border-green-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-green-900">
              Liberar retención · Type 9 (cliente presente / cancelación en plazo)
            </p>
            <p className="text-sm text-green-800">
              Anula la preautorización y libera los {Number(r.depositAmount).toFixed(2)}€ retenidos sin cargo alguno al cliente.
            </p>
          </div>
          <VoidButton id={id} />
        </div>
      )}

      {/* Type 3: Devolver cobro — garantía ya cobrada, necesitas devolverla */}
      {redsysStatusKey === "CAPTURED" && Number(r.depositAmount) > 0 && (
        <div className="bg-blue-50 border border-blue-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-blue-900">
              Devolver cobro · Type 3 (devolución bancaria)
            </p>
            <p className="text-sm text-blue-800">
              Devuelve al cliente los {Number(r.depositAmount).toFixed(2)}€ cobrados previamente.
              Esta acción no se puede deshacer.
            </p>
          </div>
          <RefundButton id={id} amount={Number(r.depositAmount)} />
        </div>
      )}

      {/* Acción: cancelar reserva */}
      {r.status !== "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-red-800">Cancelar reserva</p>
            <p className="text-sm text-red-600">La reserva quedará marcada como cancelada</p>
          </div>
          <CancelButton id={id} />
        </div>
      )}
    </div>
  );
}
