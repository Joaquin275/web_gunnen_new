/**
 * GET /api/reservations/confirm-attendance?token=XXX
 * El cliente hace clic en el enlace del email y confirma su asistencia.
 * Redirige a /reservas/confirmar con el resultado.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/reservas/confirmar?error=token_missing`);
  }

  const reservation = await prisma.reservation.findUnique({
    where: { attendanceToken: token },
    select: {
      id: true,
      status: true,
      firstName: true,
      reservationDate: true,
      reservationTime: true,
      attendanceConfirmedAt: true,
    },
  });

  if (!reservation) {
    return NextResponse.redirect(`${appUrl}/reservas/confirmar?error=not_found`);
  }

  if (reservation.status === "CANCELLED") {
    return NextResponse.redirect(`${appUrl}/reservas/confirmar?error=cancelled`);
  }

  // Ya confirmada anteriormente → redirigir igualmente a éxito
  if (reservation.attendanceConfirmedAt) {
    return NextResponse.redirect(
      `${appUrl}/reservas/confirmar?already=1&name=${encodeURIComponent(reservation.firstName)}`
    );
  }

  await prisma.reservation.update({
    where: { attendanceToken: token },
    data: { attendanceConfirmedAt: new Date() },
  });

  return NextResponse.redirect(
    `${appUrl}/reservas/confirmar?ok=1&name=${encodeURIComponent(reservation.firstName)}&date=${reservation.reservationDate.toISOString().slice(0, 10)}&time=${reservation.reservationTime}`
  );
}
