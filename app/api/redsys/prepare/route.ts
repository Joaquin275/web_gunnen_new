/**
 * POST /api/redsys/prepare
 *
 * Recibe los datos de la reserva, crea el registro como PENDING_PAYMENT
 * y devuelve los parámetros firmados para enviar al TPV Virtual Redsys.
 *
 * TransactionType = 1 → PREAUTORIZACIÓN (retención del 30%, no cobro)
 */

import { NextResponse } from "next/server";
import { reservationsDb } from "@/lib/db-json";
import {
  buildRedsysForm,
  generateRedsysOrder,
  calcDeposit30pctCents,
  eurToCents,
} from "@/lib/redsys";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      date,
      time,
      firstName,
      lastName,
      email,
      phone,
      numberOfPeople,
      observations,
      allergens,
      allergenNotes,
      couponCode,
      menuName,
      menuPrice,
    } = data;

    if (!date || !time || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // ── Variables de entorno (NUNCA en el código) ─────────────────────────
    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

    if (!secretKey || !merchantCode) {
      console.error("REDSYS_SECRET_KEY o REDSYS_MERCHANT_CODE no configurados");
      return NextResponse.json(
        { error: "Pasarela de pago no configurada" },
        { status: 500 }
      );
    }

    // ── Cálculo de importes ───────────────────────────────────────────────
    const people = numberOfPeople || 2;
    const price = menuPrice || 0;
    const estimatedTotal = price * people;           // Total estimado en €
    const depositEuros = estimatedTotal * 0.3;       // 30% de retención en €
    const amountCents = calcDeposit30pctCents(estimatedTotal); // En céntimos para Redsys

    // ── Número de pedido único ────────────────────────────────────────────
    const redsysOrder = generateRedsysOrder();

    // ── Crear reserva en estado PENDING_PAYMENT ───────────────────────────
    const reservation = reservationsDb.create({
      reservationDate: date,
      reservationTime: time,
      firstName,
      lastName,
      email,
      phone,
      numberOfPeople: people,
      observations: observations || "",
      allergens: allergens || [],
      allergenNotes: allergenNotes || "",
      couponCode: couponCode || "",
      estimatedTotal,
      depositAmount: depositEuros,
      menuName: menuName || "",
      menuPrice: price,
      status: "PENDING_PAYMENT",
      redsysOrder,
      redsysStatus: "PENDING",
      redsysAuthCode: "",
      redsysResponse: "",
      redsysCapturedAt: "",
    });

    // ── Construir parámetros Redsys ───────────────────────────────────────
    // DS_MERCHANT_TRANSACTIONTYPE = "1" → PREAUTORIZACIÓN (retención, no cobro inmediato)
    const redsysForm = buildRedsysForm(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: redsysOrder,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978", // EUR
        DS_MERCHANT_TRANSACTIONTYPE: "1", // ← PREAUTORIZACIÓN
        DS_MERCHANT_TERMINAL: terminal,
        DS_MERCHANT_MERCHANTURL: `${appUrl}/api/redsys/notify`,
        DS_MERCHANT_URLOK: `${appUrl}/reservas/ok?reservationId=${reservation.id}`,
        DS_MERCHANT_URLKO: `${appUrl}/reservas/ko?reservationId=${reservation.id}`,
        DS_MERCHANT_MERCHANTNAME: "Gunnen",
        DS_MERCHANT_PRODUCTDESCRIPTION: `Reserva ${date} ${time} · ${people} personas · ${menuName || "Menú"}`,
        DS_MERCHANT_TITULAR: `${firstName} ${lastName}`,
      },
      secretKey
    );

    return NextResponse.json({
      reservationId: reservation.id,
      redsysOrder,
      depositEuros,
      estimatedTotal,
      amountCents,
      redsysForm, // { url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature }
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Error preparando pago";
    console.error("Error en /api/redsys/prepare:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
