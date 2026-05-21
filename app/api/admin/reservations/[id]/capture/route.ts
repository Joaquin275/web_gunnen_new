import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildRedsysForm, eurToCents } from "@/lib/redsys";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    if (reservation.redsysStatus !== "PREAUTHORIZED") {
      return NextResponse.json({ error: `Estado actual: "${reservation.redsysStatus}"` }, { status: 400 });
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

    if (!secretKey || !merchantCode) {
      return NextResponse.json({ error: "Pasarela no configurada" }, { status: 500 });
    }

    const amountCents = eurToCents(Number(reservation.depositAmount));

    // TransactionType = 3 → Confirmación/captura de preautorización
    const captureForm = buildRedsysForm(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: reservation.redsysOrder!,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "3",
        DS_MERCHANT_TERMINAL: terminal,
        DS_MERCHANT_MERCHANTURL: `${appUrl}/api/redsys/notify-capture`,
        DS_MERCHANT_URLOK: `${appUrl}/admin/reservations/${id}`,
        DS_MERCHANT_URLKO: `${appUrl}/admin/reservations/${id}`,
      },
      secretKey
    );

    await prisma.reservation.update({
      where: { id },
      data: { redsysStatus: "CAPTURED", redsysCapturedAt: new Date() },
    });

    return NextResponse.json({ message: "Captura generada", captureForm });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error en captura";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
