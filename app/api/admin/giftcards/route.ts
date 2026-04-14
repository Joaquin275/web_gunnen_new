import { NextRequest, NextResponse } from "next/server";
import { giftCardsDb } from "@/lib/db-json";

export async function GET() {
  return NextResponse.json(giftCardsDb.findAll());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, amount, buyerName, buyerEmail, recipientName, recipientEmail, message, sendDate, status, redeemedAt } = body;
    if (!code || !amount || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    const giftCard = giftCardsDb.create({ code, amount, buyerName, buyerEmail, recipientName, recipientEmail, message, sendDate, status, redeemedAt });
    return NextResponse.json(giftCard, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
