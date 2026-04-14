import { NextRequest, NextResponse } from "next/server";
import { giftCardsDb } from "@/lib/db-json";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = giftCardsDb.redeem(id);
  if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(updated);
}
