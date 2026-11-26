import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function isLunch(time: string) {
  return time.startsWith("13") || time.startsWith("14");
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");

  const now = new Date();
  const year = monthParam ? parseInt(monthParam.split("-")[0]) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam.split("-")[1]) - 1 : now.getMonth();

  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const [monthReservations, history, giftCards] = await Promise.all([
    prisma.reservation.findMany({
      where: { reservationDate: { gte: from, lte: to } },
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
        estimatedTotal: true,
        depositAmount: true,
        status: true,
        redsysStatus: true,
        giftCardId: true,
      },
      orderBy: [{ reservationDate: "asc" }, { reservationTime: "asc" }],
    }),
    prisma.reservation.findMany({
      where: { status: "CONFIRMED" },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        reservationDate: true,
        numberOfPeople: true,
        estimatedTotal: true,
      },
    }),
    prisma.giftCard.findMany({
      where: { status: { not: "PENDING_PAYMENT" } },
      select: {
        amount: true,
        status: true,
        paidAt: true,
        createdAt: true,
        redeemedAt: true,
      },
    }),
  ]);

  const active = monthReservations.filter((r) => r.status !== "CANCELLED");
  const confirmed = monthReservations.filter((r) => r.status === "CONFIRMED");

  const byDay: Record<string, {
    date: string;
    covers: number;
    reservations: number;
    menus: Record<string, number>;
    list: typeof active;
  }> = {};

  for (const r of active) {
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

  const totalCovers = active.reduce((s, r) => s + r.numberOfPeople, 0);
  const totalReservations = active.length;
  const menuTotals: Record<string, number> = {};
  for (const r of active) {
    const m = r.menuName || "Sin menú";
    menuTotals[m] = (menuTotals[m] || 0) + r.numberOfPeople;
  }
  const depositTotal = active.reduce((s, r) => s + Number(r.depositAmount), 0);

  const revenue = confirmed.reduce((s, r) => s + Number(r.estimatedTotal), 0);
  const ticketsWithAmount = confirmed.filter((r) => Number(r.estimatedTotal) > 0);
  const avgTicket = ticketsWithAmount.length
    ? ticketsWithAmount.reduce((s, r) => s + Number(r.estimatedTotal), 0) / ticketsWithAmount.length
    : 0;
  const coversWithAmount = ticketsWithAmount.reduce((s, r) => s + r.numberOfPeople, 0);
  const avgTicketCover = coversWithAmount
    ? ticketsWithAmount.reduce((s, r) => s + Number(r.estimatedTotal), 0) / coversWithAmount
    : 0;

  const firstVisit = new Map<string, Date>();
  const visitsByEmail = new Map<string, {
    email: string;
    name: string;
    visits: number;
    covers: number;
    spent: number;
    lastVisit: Date;
  }>();

  for (const r of history) {
    const email = r.email.trim().toLowerCase();
    const prev = firstVisit.get(email);
    if (!prev || r.reservationDate < prev) firstVisit.set(email, r.reservationDate);

    const row = visitsByEmail.get(email);
    if (!row) {
      visitsByEmail.set(email, {
        email,
        name: `${r.firstName} ${r.lastName}`.trim(),
        visits: 1,
        covers: r.numberOfPeople,
        spent: Number(r.estimatedTotal),
        lastVisit: r.reservationDate,
      });
    } else {
      row.visits += 1;
      row.covers += r.numberOfPeople;
      row.spent += Number(r.estimatedTotal);
      if (r.reservationDate > row.lastVisit) row.lastVisit = r.reservationDate;
    }
  }

  const monthEmails = new Set(confirmed.map((r) => r.email.trim().toLowerCase()));
  let newCustomers = 0;
  let returningCustomers = 0;
  for (const email of monthEmails) {
    const first = firstVisit.get(email);
    if (first && first < from) returningCustomers += 1;
    else newCustomers += 1;
  }

  const repeatRate = monthEmails.size
    ? Math.round((returningCustomers / monthEmails.size) * 100)
    : 0;

  const topRepeat = [...visitsByEmail.values()]
    .filter((c) => c.visits >= 2)
    .sort((a, b) => b.visits - a.visits || b.spent - a.spent)
    .slice(0, 12)
    .map((c) => ({
      email: c.email,
      name: c.name,
      visits: c.visits,
      covers: c.covers,
      spent: Math.round(c.spent * 100) / 100,
      lastVisit: c.lastVisit.toISOString().slice(0, 10),
    }));

  const weekday: Record<string, { covers: number; reservations: number }> = {};
  let lunchCovers = 0;
  let dinnerCovers = 0;
  for (const r of confirmed) {
    const name = WEEKDAYS[r.reservationDate.getUTCDay()] ?? WEEKDAYS[r.reservationDate.getDay()];
    if (!weekday[name]) weekday[name] = { covers: 0, reservations: 0 };
    weekday[name].covers += r.numberOfPeople;
    weekday[name].reservations += 1;
    if (isLunch(r.reservationTime)) lunchCovers += r.numberOfPeople;
    else dinnerCovers += r.numberOfPeople;
  }

  const weekdayOrder = ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const occupancy = weekdayOrder.map((day) => ({
    day,
    covers: weekday[day]?.covers ?? 0,
    reservations: weekday[day]?.reservations ?? 0,
  }));

  const statusCount = {
    confirmed: confirmed.length,
    cancelled: monthReservations.filter((r) => r.status === "CANCELLED").length,
    pending: monthReservations.filter((r) => r.status === "PENDING_PAYMENT").length,
    rejected: monthReservations.filter((r) => r.redsysStatus === "REJECTED").length,
    withGiftCard: confirmed.filter((r) => r.giftCardId).length,
  };

  const inMonth = (d: Date | null) => d && d >= from && d <= to;
  const soldCards = giftCards.filter((g) => g.status !== "AVAILABLE" && g.status !== "CANCELLED" && inMonth(g.paidAt || g.createdAt));
  const redeemedCards = giftCards.filter((g) => inMonth(g.redeemedAt));
  const circulating = giftCards.filter((g) => g.status === "ACTIVE" || g.status === "AVAILABLE");

  return NextResponse.json({
    month: `${year}-${String(month + 1).padStart(2, "0")}`,
    totalCovers,
    totalReservations,
    depositTotal,
    menuTotals,
    days: byDay,
    command: {
      newCustomers,
      returningCustomers,
      uniqueCustomers: monthEmails.size,
      repeatRate,
      avgTicket: Math.round(avgTicket * 100) / 100,
      avgTicketCover: Math.round(avgTicketCover * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      lunchCovers,
      dinnerCovers,
      occupancy,
      statusCount,
      topRepeat,
      giftCards: {
        sold: soldCards.length,
        soldValue: Math.round(soldCards.reduce((s, g) => s + Number(g.amount), 0) * 100) / 100,
        redeemed: redeemedCards.length,
        circulating: circulating.length,
        circulatingValue: Math.round(circulating.reduce((s, g) => s + Number(g.amount), 0) * 100) / 100,
      },
    },
  });
}
