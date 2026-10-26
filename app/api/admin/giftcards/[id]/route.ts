import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/giftcards/[id]
 * Anula un bono (no se puede canjear). Conserva el registro para auditoría.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const giftCard = await prisma.giftCard.findUnique({ where: { id } });
  if (!giftCard) {
    return NextResponse.json({ error: "Bono no encontrado" }, { status: 404 });
  }
  if (giftCard.status === "REDEEMED") {
    return NextResponse.json(
      { error: "No se puede anular un bono ya canjeado" },
      { status: 400 }
    );
  }
  if (giftCard.status === "CANCELLED") {
    return NextResponse.json({ error: "Este bono ya está anulado" }, { status: 400 });
  }

  const updated = await prisma.giftCard.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({
    id: updated.id,
    code: updated.code,
    status: updated.status,
  });
}
