import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyReservationCancelled } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  const formattedDate = updated.reservationDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    await notifyReservationCancelled({
      reservationId: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      reservationDate: formattedDate,
      reservationTime: updated.reservationTime,
      numberOfPeople: updated.numberOfPeople,
      menuName: updated.menuName ?? undefined,
      refundAmount: updated.refundAmount ? Number(updated.refundAmount) : undefined,
      refundStatus: updated.refundStatus || "full",
    });
  } catch (e) {
    console.error("[Cancel] Error enviando emails:", e);
  }

  return NextResponse.json({ success: true });
}
