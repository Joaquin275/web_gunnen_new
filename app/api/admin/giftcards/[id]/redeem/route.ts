import { NextRequest, NextResponse } from "next/server";
import { giftCardsDb } from "@/lib/db-json";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const updated = giftCardsDb.redeem(params.id);
  if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(updated);
}
