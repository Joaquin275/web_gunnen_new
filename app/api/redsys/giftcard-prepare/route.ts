/**
 * POST /api/redsys/giftcard-prepare
 * Crea el bono como PENDING_PAYMENT y genera parámetros Redsys para cobro inmediato.
 * TransactionType = 0 → PAGO INMEDIATO (no preautorización)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildRedsysForm, generateRedsysOrder, eurToCents } from "@/lib/redsys";

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

    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

    if (!secretKey || !merchantCode) {
      return NextResponse.json({ error: "Pasarela de pago no configurada" }, { status: 500 });
    }

    const code = generateCode();
    const redsysOrder = generateRedsysOrder();
    const amountCents = eurToCents(Number(amount));

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const parsedSendDate = sendDate ? new Date(sendDate) : new Date();

    // Crear bono en PENDING_PAYMENT
    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount: Number(amount),
        remainingAmount: Number(amount),
        status: "PENDING_PAYMENT",
        menuName: menuName || null,
        purchaserName: purchaserName || "—",
        purchaserEmail: purchaserEmail || "—",
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || purchaserEmail || "—",
        message: message || null,
        sendDate: parsedSendDate,
        expiresAt,
        stripePaymentIntentId: redsysOrder, // reutilizamos el campo para guardar el redsysOrder
      },
    });

    // TransactionType = 0 → PAGO INMEDIATO
    const redsysForm = buildRedsysForm(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: redsysOrder,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "0", // ← cobro inmediato
        DS_MERCHANT_TERMINAL: terminal,
        DS_MERCHANT_MERCHANTURL: `${appUrl}/api/redsys/notify-giftcard`,
        DS_MERCHANT_URLOK: `${appUrl}/regala/ok?giftCardId=${giftCard.id}`,
        DS_MERCHANT_URLKO: `${appUrl}/regala/ko?giftCardId=${giftCard.id}`,
        DS_MERCHANT_MERCHANTNAME: "Gunnen",
        DS_MERCHANT_PRODUCTDESCRIPTION: `Bono Regalo — ${menuName}`,
        DS_MERCHANT_TITULAR: purchaserName || "Cliente",
      },
      secretKey
    );

    return NextResponse.json({
      giftCardId: giftCard.id,
      redsysOrder,
      amountCents,
      redsysForm,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error preparando el pago";
    console.error("Error en /api/redsys/giftcard-prepare:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
