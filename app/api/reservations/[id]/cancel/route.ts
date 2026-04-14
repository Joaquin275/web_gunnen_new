import { NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = reservationsDb.findById(id);
    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    if (reservation.status === "CANCELLED") {
      return NextResponse.json({ error: "La reserva ya está cancelada" }, { status: 400 });
    }
    const updated = reservationsDb.update(id, { status: "CANCELLED" });
    return NextResponse.json({ success: true, reservation: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error cancelando reserva";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
