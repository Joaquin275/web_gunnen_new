import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generar código único para el bono
function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin caracteres confusos
  let code = "GUNNEN-";
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  code += "-";
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      amount,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      message,
      sendDate,
    } = data;

    if (!amount || amount < 50 || amount > 500) {
      return NextResponse.json(
        { error: "Importe inválido" },
        { status: 400 }
      );
    }

    // Generar código único
    let code = generateGiftCardCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.giftCard.findUnique({
        where: { code },
      });
      if (!existing) break;
      code = generateGiftCardCode();
      attempts++;
    }

    // Calcular fecha de expiración (12 meses desde emisión)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Crear bono regalo
    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount,
        remainingAmount: amount,
        status: "PENDING_PAYMENT",
        purchaserName,
        purchaserEmail,
        recipientName,
        recipientEmail,
        message,
        sendDate: new Date(sendDate),
        expiresAt,
      },
    });

    return NextResponse.json({
      giftCardId: giftCard.id,
      code: giftCard.code,
    });
  } catch (error: any) {
    console.error("Error creating gift card:", error);
    return NextResponse.json(
      { error: error.message || "Error creando bono regalo" },
      { status: 500 }
    );
  }
}
