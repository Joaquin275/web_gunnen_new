/**
 * GET /api/cron/reminders
 *
 * Ejecutado por Vercel Cron:
 *  - 07:00 UTC (09:00 Madrid) → recordatorio 24h antes (reservas de mañana)
 *  - 08:00 UTC (10:00 Madrid) → recordatorio mismo día (desde las 10:00 Madrid) + resumen admin
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendReservationReminder,
  sendAdminDailyBriefing,
  type ReservationEmailData,
} from "@/lib/email";
import {
  madridDateKey,
  addDaysToDateKey,
  dateKeyToUtcDate,
  isSameDayReminderWindow,
} from "@/lib/timezone";

export const dynamic = "force-dynamic";

type CronMode = "24h" | "same_day";

function authorize(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) return false;
  return true;
}

function toEmailData(r: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  reservationDate: Date;
  reservationTime: string;
  numberOfPeople: number;
  menuName: string | null;
  estimatedTotal: unknown;
  depositAmount: unknown;
  attendanceToken: string | null;
}): ReservationEmailData {
  return {
    reservationId: r.id,
    email: r.email,
    firstName: r.firstName,
    lastName: r.lastName,
    reservationDate: r.reservationDate,
    reservationTime: r.reservationTime,
    numberOfPeople: r.numberOfPeople,
    menuName: r.menuName ?? undefined,
    estimatedTotal: Number(r.estimatedTotal),
    depositAmount: Number(r.depositAmount),
    attendanceToken: r.attendanceToken ?? undefined,
  };
}

async function handle24hReminders() {
  const tomorrowKey = addDaysToDateKey(madridDateKey(), 1);
  const tomorrowDate = dateKeyToUtcDate(tomorrowKey);

  const reservations = await prisma.reservation.findMany({
    where: {
      status: "CONFIRMED",
      reservationDate: tomorrowDate,
      reminder24hSentAt: null,
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const r of reservations) {
    try {
      await sendReservationReminder(toEmailData(r), "24h");
      await prisma.reservation.update({
        where: { id: r.id },
        data: { reminder24hSentAt: new Date() },
      });
      sent++;
    } catch (e) {
      errors.push(`24h-${r.id}: ${e}`);
    }
  }

  return { sent, errors, total: reservations.length };
}

async function handleSameDayReminders() {
  if (!isSameDayReminderWindow()) {
    return { sent: 0, errors: [], total: 0, skipped: "before_11_madrid" };
  }

  const todayKey = madridDateKey();
  const todayDate = dateKeyToUtcDate(todayKey);

  const reservations = await prisma.reservation.findMany({
    where: {
      status: "CONFIRMED",
      reservationDate: todayDate,
      reminderSameDaySentAt: null,
    },
    orderBy: { reservationTime: "asc" },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const r of reservations) {
    try {
      await sendReservationReminder(toEmailData(r), "same_day");
      await prisma.reservation.update({
        where: { id: r.id },
        data: { reminderSameDaySentAt: new Date() },
      });
      sent++;
    } catch (e) {
      errors.push(`same_day-${r.id}: ${e}`);
    }
  }

  // Resumen diario al admin (a las 11:00 junto con recordatorios del día)
  try {
    await sendAdminDailyBriefing(reservations.map(toEmailData));
  } catch (e) {
    errors.push(`admin-briefing: ${e}`);
  }

  return { sent, errors, total: reservations.length };
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const mode = (request.nextUrl.searchParams.get("mode") || "all") as CronMode | "all";

  try {
    const results: Record<string, unknown> = { ok: true, madridNow: madridDateKey() };

    if (mode === "24h" || mode === "all") {
      results.reminder24h = await handle24hReminders();
    }

    if (mode === "same_day" || mode === "all") {
      results.reminderSameDay = await handleSameDayReminders();
    }

    console.log("[Cron Reminders]", results);
    return NextResponse.json(results);
  } catch (error) {
    console.error("[Cron Reminders] Error:", error);
    return NextResponse.json({ error: "Error en cron" }, { status: 500 });
  }
}
