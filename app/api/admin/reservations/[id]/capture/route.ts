/**
 * POST /api/admin/reservations/[id]/capture
 *
 * Confirma/captura una preautorización Redsys (TransactionType=3).
 * Usar cuando el cliente no se presenta o cancela fuera de plazo.
 *
 * Redsys REST: https://sis.redsys.es/sis/rest/trataPeticionREST
 */

import { NextRequest, NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";
import { buildRedsysForm, eurToCents } from "@/lib/redsys";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = reservationsDb.findById(id);

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (reservation.redsysStatus !== "PREAUTHORIZED") {
      return NextResponse.json(
        { error: `No se puede capturar: estado actual es "${reservation.redsysStatus}"` },
        { status: 400 }
      );
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

    if (!secretKey || !merchantCode) {
      return NextResponse.json(
        { error: "Pasarela de pago no configurada" },
        { status: 500 }
      );
    }

    const amountCents = eurToCents(reservation.depositAmount);

    // ── Construir operación de confirmación (Type=3) ─────────────────────
    // TransactionType = 3 → Confirmación de preautorización (cobro efectivo)
    const captureForm = buildRedsysForm(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: reservation.redsysOrder,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "3", // ← CONFIRMACIÓN DE PREAUTORIZACIÓN
        DS_MERCHANT_TERMINAL: terminal,
        DS_MERCHANT_MERCHANTURL: `${appUrl}/api/redsys/notify`,
        DS_MERCHANT_URLOK: `${appUrl}/admin/reservations/${id}`,
        DS_MERCHANT_URLKO: `${appUrl}/admin/reservations/${id}`,
      },
      secretKey
    );

    // Marcar como en proceso de captura
    reservationsDb.update(id, {
      redsysCapturedAt: new Date().toISOString(),
      redsysStatus: "CAPTURED",
    });

    return NextResponse.json({
      message: "Formulario de captura generado. Enviar al TPV Virtual.",
      captureForm,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error en captura";
    console.error("Error en captura Redsys:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
