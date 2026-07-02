import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/admin/reservations/[id]/mark-expired
 * Marca manualmente una preautorización como caducada.
 * Usado cuando la preautorización lleva más de 7 días y Redsys ya no puede operarla.
 * La retención habrá sido liberada automáticamente por el banco.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    if (reservation.redsysStatus !== "PREAUTHORIZED") {
      return NextResponse.json(
        { error: "Solo se puede marcar como caducada una retención en estado PREAUTHORIZED" },
        { status: 400 }
      );
    }

    await prisma.reservation.update({
      where: { id },
      data: {
        redsysStatus: "PREAUTH_EXPIRED",
        redsysResponse: "EXPIRED_MANUALLY",
      },
    });

    return NextResponse.json({ message: "Retención marcada como caducada" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error actualizando estado";
    console.error("[MARK-EXPIRED] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
