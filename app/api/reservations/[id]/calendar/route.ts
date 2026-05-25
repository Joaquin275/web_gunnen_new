import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateIcs, reservationIcsOptions } from "@/lib/ics";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json({ error: "La reserva aún no está confirmada" }, { status: 400 });
    }

    const ics = generateIcs(reservationIcsOptions(reservation));

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="reserva-gunnen.ics"',
      },
    });
  } catch (error) {
    console.error("Error generating calendar file:", error);
    return NextResponse.json({ error: "Error generando calendario" }, { status: 500 });
  }
}
