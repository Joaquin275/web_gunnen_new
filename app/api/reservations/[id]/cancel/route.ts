import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    if (reservation.status === "CANCELLED") {
      return NextResponse.json({ error: "La reserva ya está cancelada" }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error cancelando reserva";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
