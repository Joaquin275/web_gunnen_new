import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json({ error: "Error obteniendo reserva" }, { status: 500 });
  }
}
