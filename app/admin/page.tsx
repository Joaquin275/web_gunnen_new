import { prisma } from "@/lib/prisma";
import { pressDb } from "@/lib/db-json";
import Link from "next/link";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalReservations, todayReservations, pendingReservations, recentReservations] =
    await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { reservationDate: { gte: today, lt: tomorrow } } }),
      prisma.reservation.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.reservation.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const activeGiftCards = await prisma.giftCard.count({
    where: { status: { in: ["AVAILABLE", "ACTIVE"] } },
  });
  const totalPress = pressDb.findAll().length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-light">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de Gunnen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-6">
          <div className="text-3xl font-serif font-light mb-1">{totalReservations}</div>
          <div className="text-xs tracking-wider uppercase text-gray-500">Reservas totales</div>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="text-3xl font-serif font-light mb-1">{todayReservations}</div>
          <div className="text-xs tracking-wider uppercase text-gray-500">Reservas hoy</div>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="text-3xl font-serif font-light text-amber-600 mb-1">{pendingReservations}</div>
          <div className="text-xs tracking-wider uppercase text-gray-500">Pendientes pago</div>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="text-3xl font-serif font-light text-green-700 mb-1">{activeGiftCards}</div>
          <div className="text-xs tracking-wider uppercase text-gray-500">Bonos activos</div>
        </div>
      </div>

      {/* Últimas reservas */}
      <div className="bg-white border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif font-light text-xl">Últimas reservas</h2>
          <Link href="/admin/reservations" className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary">
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentReservations.length === 0 ? (
            <p className="px-6 py-8 text-gray-400 text-center">Sin reservas aún</p>
          ) : (
            recentReservations.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.firstName} {r.lastName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(r.reservationDate).toLocaleDateString("es-ES")} · {r.reservationTime} · {r.numberOfPeople} personas · {r.menuName || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{Number(r.depositAmount).toFixed(2)}€</span>
                  <span className={`text-xs px-2 py-1 tracking-wider uppercase ${
                    r.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : r.status === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.status === "CONFIRMED" ? "Confirmada" : r.status === "CANCELLED" ? "Cancelada" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/reservations" className="bg-white border border-gray-200 p-6 hover:border-primary transition-colors group">
          <div className="text-2xl font-serif font-light mb-2 group-hover:text-primary">Reservas</div>
          <p className="text-sm text-gray-500">Gestionar todas las reservas</p>
        </Link>
        <Link href="/admin/press" className="bg-white border border-gray-200 p-6 hover:border-primary transition-colors group">
          <div className="text-2xl font-serif font-light mb-2 group-hover:text-primary">Prensa</div>
          <p className="text-sm text-gray-500">{totalPress} publicaciones · Crear y editar</p>
        </Link>
        <Link href="/admin/giftcards" className="bg-white border border-gray-200 p-6 hover:border-primary transition-colors group">
          <div className="text-2xl font-serif font-light mb-2 group-hover:text-primary">Bonos Regalo</div>
          <p className="text-sm text-gray-500">{activeGiftCards} bonos activos</p>
        </Link>
      </div>
    </div>
  );
}
