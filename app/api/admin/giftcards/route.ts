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
    const { amount, buyerName, buyerEmail, recipientName, recipientEmail, message, sendDate, customCode } = body;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }

    // Use custom code if provided, otherwise auto-generate
    const code = customCode?.trim() ? customCode.trim().toUpperCase() : generateCode();

    // Check for duplicate code
    const existing = giftCardsDb.findByCode(code);
    if (existing) {
      return NextResponse.json({ error: `El código ${code} ya existe` }, { status: 409 });
    }

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
