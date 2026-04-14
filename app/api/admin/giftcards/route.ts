import { NextRequest, NextResponse } from "next/server";
import { giftCardsDb } from "@/lib/db-json";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GUNNEN-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += "-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export async function GET() {
  const giftCards = giftCardsDb.findAll();
  return NextResponse.json(giftCards);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, buyerName, buyerEmail, recipientName, recipientEmail, message, sendDate } = body;

    if (!amount || amount < 10) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }

    const code = generateCode();

    const giftCard = giftCardsDb.create({
      code,
      amount: Number(amount),
      buyerName: buyerName || recipientName || "—",
      buyerEmail: buyerEmail || recipientEmail || "—",
      recipientName: recipientName || buyerName || "—",
      recipientEmail: recipientEmail || buyerEmail || "—",
      message: message || "",
      status: "ACTIVE",
      sendDate: sendDate || new Date().toISOString().split("T")[0],
      redeemedAt: null,
    });

    return NextResponse.json({ id: giftCard.id, code: giftCard.code });
  } catch (error) {
    console.error("Error creating gift card:", error);
    return NextResponse.json({ error: "Error creando bono regalo" }, { status: 500 });
  }
}
