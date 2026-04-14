import { NextRequest, NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = reservationsDb.update(id, { status: "CANCELLED" });
  if (!updated) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ success: true, reservation: updated });
}
