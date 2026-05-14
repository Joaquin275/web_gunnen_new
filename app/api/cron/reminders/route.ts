/**
 * GET /api/cron/reminders
 *
 * Ejecutado automáticamente por Vercel Cron Jobs cada día a las 08:00 (hora España).
 * Envía:
 *  1. Recordatorio al cliente 3 días antes de su reserva
 *  2. Recordatorio al cliente la mañana del día de la reserva
 *  3. Resumen diario al admin con todas las reservas de hoy
 *
 * vercel.json configura el schedule: "0 7 * * *" (08:00 Madrid = 07:00 UTC)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendReservationReminder,
  sendAdminDailyBriefing,
  type ReservationEmailData,
} from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Protección: solo Vercel Cron o llamada con clave secreta
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();

    // ── Fecha de hoy (sin hora) ─────────────────────────────────────────────
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // ── Fecha en 3 días ─────────────────────────────────────────────────────
    const in3daysStart = new Date(now);
    in3daysStart.setDate(in3daysStart.getDate() + 3);
    in3daysStart.setHours(0, 0, 0, 0);
    const in3daysEnd = new Date(in3daysStart);
    in3daysEnd.setHours(23, 59, 59, 999);

    // ── Consultar reservas CONFIRMED ────────────────────────────────────────
    const [todayReservations, in3daysReservations] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          reservationDate: { gte: todayStart, lte: todayEnd },
          status: "CONFIRMED",
        },
        orderBy: { reservationTime: "asc" },
      }),
      prisma.reservation.findMany({
        where: {
          reservationDate: { gte: in3daysStart, lte: in3daysEnd },
          status: "CONFIRMED",
        },
      }),
    ]);

    const toEmailData = (r: typeof todayReservations[0]): ReservationEmailData => ({
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
    });

    const results = {
      morningReminders: 0,
      threeDayReminders: 0,
      adminBriefing: false,
      errors: [] as string[],
    };

    // ── 1. Recordatorio mañana de la reserva ────────────────────────────────
    for (const r of todayReservations) {
      try {
        await sendReservationReminder(toEmailData(r), "morning");
        results.morningReminders++;
      } catch (e) {
        results.errors.push(`morning-${r.id}: ${e}`);
      }
    }

    // ── 2. Recordatorio 3 días antes ────────────────────────────────────────
    for (const r of in3daysReservations) {
      try {
        await sendReservationReminder(toEmailData(r), "3days");
        results.threeDayReminders++;
      } catch (e) {
        results.errors.push(`3days-${r.id}: ${e}`);
      }
    }

    // ── 3. Resumen diario al admin ──────────────────────────────────────────
    try {
      await sendAdminDailyBriefing(todayReservations.map(toEmailData));
      results.adminBriefing = todayReservations.length > 0;
    } catch (e) {
      results.errors.push(`admin-briefing: ${e}`);
    }

    console.log("[Cron Reminders]", results);
    return NextResponse.json({ ok: true, ...results });
  } catch (error) {
    console.error("[Cron Reminders] Error:", error);
    return NextResponse.json({ error: "Error en cron" }, { status: 500 });
  }
}
