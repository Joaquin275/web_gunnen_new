import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await prisma.giftCard.update({
      where: { id },
      data: { status: "REDEEMED", redeemedAt: new Date() },
    });
    return NextResponse.json({
      id: updated.id,
      code: updated.code,
      status: updated.status,
      redeemedAt: updated.redeemedAt?.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
