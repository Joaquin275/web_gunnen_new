import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGiftCard } from "@/lib/email";

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
    const {
      amount, menuName,
      purchaserName, purchaserEmail,
      recipientName, recipientEmail,
      message, sendDate,
    } = data;

    if (!amount || amount < 50 || amount > 500) {
      return NextResponse.json({ error: "Importe inválido (50€–500€)" }, { status: 400 });
    }
    if (!menuName) {
      return NextResponse.json({ error: "Debes seleccionar un menú" }, { status: 400 });
    }

    const code = generateCode();

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const parsedSendDate = sendDate ? new Date(sendDate) : new Date();

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount: Number(amount),
        remainingAmount: Number(amount),
        status: "ACTIVE",
        menuName: menuName || null,
        purchaserName: purchaserName || "—",
        purchaserEmail: purchaserEmail || "—",
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || purchaserEmail || "—",
        message: message || null,
        sendDate: parsedSendDate,
        expiresAt,
      },
    });

    // Enviar email al destinatario si la fecha de envío es hoy
    const today = new Date().toISOString().split("T")[0];
    const isSendToday = (sendDate || today) === today;

    if (isSendToday) {
      await sendGiftCard({
        code: giftCard.code,
        amount: Number(giftCard.amount),
        menuName: giftCard.menuName || menuName,
        purchaserName: giftCard.purchaserName,
        recipientName: giftCard.recipientName || undefined,
        recipientEmail: giftCard.recipientEmail,
        message: giftCard.message || undefined,
        expiresAt: expiresAt.toLocaleDateString("es-ES"),
      });
    }

    return NextResponse.json({ giftCardId: giftCard.id, code: giftCard.code });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error creando bono regalo";
    console.error("Error en /api/giftcards:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
