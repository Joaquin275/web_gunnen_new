import { NextRequest, NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const updated = reservationsDb.update(params.id, { status: "CANCELLED" });
  if (!updated) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ success: true, reservation: updated });
}
