import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  if (!updated) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  return NextResponse.json({ success: true });
}
