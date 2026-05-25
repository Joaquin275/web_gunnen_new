import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month"); // YYYY-MM

  const now = new Date();
  const year = monthParam ? parseInt(monthParam.split("-")[0]) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam.split("-")[1]) - 1 : now.getMonth();

  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const reservations = await prisma.reservation.findMany({
    where: {
      reservationDate: { gte: from, lte: to },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      reservationDate: true,
      reservationTime: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      numberOfPeople: true,
      menuName: true,
      depositAmount: true,
      status: true,
    },
    orderBy: [{ reservationDate: "asc" }, { reservationTime: "asc" }],
  });

  // Agrupar por día
  const byDay: Record<string, {
    date: string;
    covers: number;
    reservations: number;
    menus: Record<string, number>;
    list: typeof reservations;
  }> = {};

  for (const r of reservations) {
    const key = r.reservationDate.toISOString().split("T")[0];
    if (!byDay[key]) {
      byDay[key] = { date: key, covers: 0, reservations: 0, menus: {}, list: [] };
    }
    byDay[key].covers += r.numberOfPeople;
    byDay[key].reservations += 1;
    const menu = r.menuName || "Sin menú";
    byDay[key].menus[menu] = (byDay[key].menus[menu] || 0) + r.numberOfPeople;
    byDay[key].list.push(r);
  }

  // Totales del mes
  const totalCovers = reservations.reduce((s, r) => s + r.numberOfPeople, 0);
  const totalReservations = reservations.length;
  const menuTotals: Record<string, number> = {};
  for (const r of reservations) {
    const m = r.menuName || "Sin menú";
    menuTotals[m] = (menuTotals[m] || 0) + r.numberOfPeople;
  }

  const depositTotal = reservations.reduce(
    (s, r) => s + Number(r.depositAmount),
    0
  );

  return NextResponse.json({
    month: `${year}-${String(month + 1).padStart(2, "0")}`,
    totalCovers,
    totalReservations,
    depositTotal,
    menuTotals,
    days: byDay,
  });
}
