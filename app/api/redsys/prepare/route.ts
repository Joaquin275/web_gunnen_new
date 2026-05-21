/**
 * POST /api/redsys/prepare
 * Crea la reserva como PENDING_PAYMENT y genera parámetros firmados para Redsys.
 * TransactionType = 1 → PREAUTORIZACIÓN (retención 30%, no cobro)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildRedsysForm,
  generateRedsysOrder,
  calcDeposit30pctCents,
} from "@/lib/redsys";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      date, time, firstName, lastName, email, phone,
      numberOfPeople, observations, allergens, allergenNotes,
      couponCode, menuName, menuPrice,
    } = data;

    if (!date || !time || !firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL || "1";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-gunnen-new.vercel.app";

    if (!secretKey || !merchantCode) {
      return NextResponse.json({ error: "Pasarela de pago no configurada" }, { status: 500 });
    }

    const people = Number(numberOfPeople) || 2;
    const price = Number(menuPrice);

    console.log(`[Redsys Prepare] menuPrice recibido: ${menuPrice} (tipo: ${typeof menuPrice}) → price: ${price}`);
    console.log(`[Redsys Prepare] numberOfPeople: ${numberOfPeople} → people: ${people}`);
    console.log(`[Redsys Prepare] menuName: ${menuName}`);

    if (!price || isNaN(price) || price <= 0) {
      console.error(`[Redsys Prepare] PRECIO INVÁLIDO: menuPrice=${menuPrice}`);
      return NextResponse.json(
        { error: "Precio del menú inválido. Vuelve atrás y selecciona un menú." },
        { status: 400 }
      );
    }

    const estimatedTotal = price * people;
    const depositEuros = estimatedTotal * 0.3;
    const amountCents = calcDeposit30pctCents(estimatedTotal);

    console.log(`[Redsys Prepare] estimatedTotal: ${estimatedTotal}€ | depositEuros: ${depositEuros}€ | amountCents: ${amountCents}`);

    if (amountCents <= 0) {
      return NextResponse.json(
        { error: "El importe de la retención no puede ser 0. Selecciona un menú." },
        { status: 400 }
      );
    }

    const redsysOrder = generateRedsysOrder();

    const reservation = await prisma.reservation.create({
      data: {
        reservationDate: new Date(date + "T00:00:00"),
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
      },
    });

    // DS_MERCHANT_TRANSACTIONTYPE = "1" → PREAUTORIZACIÓN
    const redsysForm = buildRedsysForm(
      {
        DS_MERCHANT_AMOUNT: String(amountCents),
        DS_MERCHANT_ORDER: redsysOrder,
        DS_MERCHANT_MERCHANTCODE: merchantCode,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "1",
        DS_MERCHANT_TERMINAL: terminal,
        DS_MERCHANT_MERCHANTURL: `${appUrl}/api/redsys/notify`,
        DS_MERCHANT_URLOK: `${appUrl}/reservas/ok?reservationId=${reservation.id}`,
        DS_MERCHANT_URLKO: `${appUrl}/reservas/ko?reservationId=${reservation.id}`,
        DS_MERCHANT_MERCHANTNAME: "Gunnen",
        DS_MERCHANT_PRODUCTDESCRIPTION: `Reserva ${date} ${time} · ${people} personas`,
        DS_MERCHANT_TITULAR: `${firstName} ${lastName}`,
      },
      secretKey
    );

    return NextResponse.json({ reservationId: reservation.id, redsysOrder, depositEuros, estimatedTotal, amountCents, redsysForm });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error preparando pago";
    console.error("Error en /api/redsys/prepare:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
