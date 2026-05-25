import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyReservationConfirmed } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no está configurado");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Error verifying webhook signature:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Manejar eventos
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id: paymentIntentId, amount, currency, customer, payment_method } = paymentIntent;

  // Buscar si ya existe un pago registrado (idempotencia)
  const existingPayment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { reservation: true },
  });

  if (existingPayment) {
    // Ya procesado, solo actualizar estado si es necesario
    if (existingPayment.status !== "SUCCEEDED") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "SUCCEEDED" },
      });

      await prisma.reservation.update({
        where: { id: existingPayment.reservationId },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      // Enviar email de confirmación
      const reservation = existingPayment.reservation;
      await notifyReservationConfirmed({
        email: reservation.email,
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        numberOfPeople: reservation.numberOfPeople,
        depositAmount: Number(reservation.depositAmount),
        reservationId: reservation.id,
      });
    }
    return;
  }

  // Buscar reserva pendiente (por metadata o buscar la más reciente pending)
  const reservation = await prisma.reservation.findFirst({
    where: {
      status: "PENDING_PAYMENT",
      depositAmount: amount / 100, // Stripe usa centavos
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!reservation) {
    console.error("No se encontró reserva pendiente para este pago");
    return;
  }

  // Determinar método de pago
  let paymentMethod: "CARD" | "SEPA_DEBIT" = "CARD";
  if (payment_method) {
    const pm = await stripe.paymentMethods.retrieve(payment_method);
    if (pm.type === "sepa_debit") {
      paymentMethod = "SEPA_DEBIT";
    }
  }

  // Crear registro de pago
  await prisma.payment.create({
    data: {
      reservationId: reservation.id,
      amount: reservation.depositAmount,
      currency: currency,
      paymentMethod,
      status: "SUCCEEDED",
      stripePaymentIntentId: paymentIntentId,
      stripeCustomerId: customer,
    },
  });

  // Actualizar reserva
  await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    },
  });

  // Enviar email de confirmación
  await sendReservationConfirmation({
    email: reservation.email,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    reservationDate: reservation.reservationDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    reservationTime: reservation.reservationTime,
    numberOfPeople: reservation.numberOfPeople,
    depositAmount: Number(reservation.depositAmount),
    reservationId: reservation.id,
  });

  console.log(`Reserva ${reservation.id} confirmada exitosamente`);
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { id: paymentIntentId } = paymentIntent;

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        errorMessage: paymentIntent.last_payment_error?.message || "Pago fallido",
      },
    });
  }

  console.log(`Pago fallido: ${paymentIntentId}`);
}

async function handleChargeRefunded(charge: any) {
  const paymentIntentId = charge.payment_intent;

  if (!paymentIntentId) return;

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (payment) {
    const refundAmount = charge.amount_refunded / 100;
    const isFullRefund = refundAmount === Number(payment.amount);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });

    console.log(`Reembolso procesado: ${refundAmount}€ para pago ${payment.id}`);
  }
}
