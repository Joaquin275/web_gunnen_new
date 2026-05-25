import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inventoryDefaults } from "@/lib/giftcards-pool";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GUNNEN-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += "-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function serialize(g: Awaited<ReturnType<typeof prisma.giftCard.findMany>>[number]) {
  return {
    id: g.id,
    code: g.code,
    amount: Number(g.amount),
    buyerName: g.purchaserName,
    buyerEmail: g.purchaserEmail,
    recipientName: g.recipientName || g.purchaserName,
    recipientEmail: g.recipientEmail,
    message: g.message || "",
    status: g.status,
    menuName: g.menuName || "",
    sendDate: g.sendDate.toISOString().split("T")[0],
    redeemedAt: g.redeemedAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
  };
}

export async function GET() {
  const giftCards = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(giftCards.map(serialize));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, buyerName, buyerEmail, recipientName, recipientEmail, message, sendDate, customCode } = body;

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }

    const code = customCode?.trim() ? customCode.trim().toUpperCase() : generateCode();

    const existing = await prisma.giftCard.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `El código ${code} ya existe` }, { status: 409 });
    }

    const defaults = inventoryDefaults(Number(amount), code);

    const giftCard = await prisma.giftCard.create({
      data: {
        ...defaults,
        // Si el admin rellena datos de comprador, crear como ACTIVE directamente
        ...(buyerName && buyerEmail
          ? {
              status: "ACTIVE" as const,
              purchaserName: buyerName,
              purchaserEmail: buyerEmail,
              recipientName: recipientName || buyerName,
              recipientEmail: recipientEmail || buyerEmail,
              message: message || null,
              sendDate: sendDate ? new Date(sendDate) : new Date(),
              paidAt: new Date(),
            }
          : {}),
      },
    });

    return NextResponse.json(serialize(giftCard));
  } catch (error) {
    console.error("Error creating gift card:", error);
    return NextResponse.json({ error: "Error creando bono regalo" }, { status: 500 });
  }
}
