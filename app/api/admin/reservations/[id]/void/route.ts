import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callRedsysREST, eurToCents } from "@/lib/redsys";

/**
 * POST /api/admin/reservations/[id]/void
 * TransactionType = 9 → Anulación de preautorización (liberar retención).
 * Usado cuando el cliente se presenta correctamente o cancela dentro del plazo permitido.
 * La retención bancaria queda liberada sin cargo alguno.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    if (reservation.redsysStatus !== "PREAUTHORIZED") {
      return NextResponse.json(
        { error: `Solo se puede anular una preautorización activa. Estado actual: "${reservation.redsysStatus}"` },
        { status: 400 }
      );
    }
    if (!reservation.redsysOrder) {
      return NextResponse.json({ error: "La reserva no tiene número de pedido Redsys" }, { status: 400 });
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";

    if (!secretKey || !merchantCode) {
      return NextResponse.json({ error: "Pasarela no configurada" }, { status: 500 });
    }

    const amountCents = eurToCents(Number(reservation.depositAmount));

    console.log("[VOID] Iniciando anulación Type=9 para reserva", id, "order:", reservation.redsysOrder, "importe:", amountCents, "céntimos");

    // TransactionType = 9 → Anulación de preautorización (liberar retención)
    const result = await callRedsysREST(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: reservation.redsysOrder,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "9",
        DS_MERCHANT_TERMINAL: terminal,
      },
      secretKey
    );

    console.log("[VOID] Respuesta Redsys:", result.dsResponse, "approved:", result.approved);

    if (!result.approved) {
      return NextResponse.json(
        {
          error: `Redsys rechazó la anulación. Código: ${result.dsResponse}`,
          dsResponse: result.dsResponse,
        },
        { status: 402 }
      );
    }

    await prisma.reservation.update({
      where: { id },
      data: {
        redsysStatus: "REFUNDED",
        redsysResponse: result.dsResponse,
      },
    });

    return NextResponse.json({
      message: "Retención liberada correctamente",
      dsResponse: result.dsResponse,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al liberar retención";
    console.error("[VOID] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
