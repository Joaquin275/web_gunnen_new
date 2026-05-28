/**
 * POST /api/redsys/giftcard-prepare
 * Reserva un código del inventario (AVAILABLE) y genera parámetros Redsys.
 * TransactionType = 0 → PAGO INMEDIATO
 */

import { NextResponse } from "next/server";
import { buildRedsysForm, generateRedsysOrder, eurToCents } from "@/lib/redsys";
import { claimAvailableGiftCard } from "@/lib/giftcards-pool";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      amount, menuName,
      purchaserName, purchaserEmail,
      recipientName, recipientEmail,
      message, sendDate,
    } = data;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }
    if (!menuName) {
      return NextResponse.json({ error: "Debes seleccionar un menú" }, { status: 400 });
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.gunnen.es";

    if (!secretKey || !merchantCode) {
      return NextResponse.json({ error: "Pasarela de pago no configurada" }, { status: 500 });
    }

    const redsysOrder = generateRedsysOrder();
    const amountCents = eurToCents(Number(amount));

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    const parsedSendDate = sendDate ? new Date(sendDate) : new Date();

    // Asignar un código aleatorio del inventario pre-cargado por el admin
    const giftCard = await claimAvailableGiftCard({
      amount: Number(amount),
      menuName,
      purchaserName: purchaserName || "—",
      purchaserEmail: purchaserEmail || "—",
      recipientName: recipientName || undefined,
      recipientEmail: recipientEmail || purchaserEmail || "—",
      message: message || undefined,
      sendDate: parsedSendDate,
      expiresAt,
      redsysOrder,
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: "No se pudo crear el bono regalo. Por favor inténtalo de nuevo." },
        { status: 500 }
      );
    }

    const redsysForm = buildRedsysForm(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: redsysOrder,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "0",
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
      code: giftCard.code,
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
