import { NextResponse } from "next/server";
import { giftCardsDb } from "@/lib/db-json";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GUNNEN-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += "-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { amount, purchaserName, purchaserEmail, recipientName, recipientEmail, message, sendDate } = data;

    if (!amount || amount < 50 || amount > 500) {
      return NextResponse.json({ error: "Importe inválido (50€–500€)" }, { status: 400 });
    }

    const code = generateCode();

    const giftCard = giftCardsDb.create({
      code,
      amount: Number(amount),
      buyerName: purchaserName || "—",
      buyerEmail: purchaserEmail || "—",
      recipientName: recipientName || "—",
      recipientEmail: recipientEmail || purchaserEmail || "—",
      message: message || "",
      status: "ACTIVE",
      sendDate: sendDate || new Date().toISOString().split("T")[0],
      redeemedAt: null,
    });

    return NextResponse.json({ giftCardId: giftCard.id, code: giftCard.code });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error creando bono regalo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
