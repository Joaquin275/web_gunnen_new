import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendCancellationConfirmation } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { payment: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "La reserva ya está cancelada" },
        { status: 400 }
      );
    }

    // Calcular horas entre ahora y la reserva
    const now = new Date();
    const reservationDateTime = new Date(reservation.reservationDate);
    const [hours, minutes] = reservation.reservationTime.split(':');
    reservationDateTime.setHours(parseInt(hours), parseInt(minutes));

    const hoursUntilReservation = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Obtener reglas de cancelación
    const cancelRules = await prisma.cancelPolicyRule.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });

    // Determinar porcentaje de reembolso
    let refundPercentage = 0;
    for (const rule of cancelRules) {
      if (hoursUntilReservation >= rule.minHoursBefore) {
        if (!rule.maxHoursBefore || hoursUntilReservation <= rule.maxHoursBefore) {
          refundPercentage = rule.refundPercentage;
          break;
        }
      }
    }

    // Si no hay reglas, aplicar política por defecto
    if (cancelRules.length === 0) {
      if (hoursUntilReservation >= 72) {
        refundPercentage = 100;
      } else if (hoursUntilReservation >= 48) {
        refundPercentage = 100; // Por defecto entre 48-72h
      } else {
        refundPercentage = 0;
      }
    }

    const depositAmount = Number(reservation.depositAmount);
    const refundAmount = (depositAmount * refundPercentage) / 100;

    let refundStatus = "none";
    if (refundPercentage === 100) {
      refundStatus = "full";
    } else if (refundPercentage > 0) {
      refundStatus = "partial";
    }

    // Procesar reembolso en Stripe si corresponde
    if (refundAmount > 0 && reservation.payment && reservation.payment.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: reservation.payment.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100), // Stripe usa centavos
        });

        console.log(`Reembolso procesado: ${refundAmount}€`);
      } catch (stripeError: any) {
        console.error("Error procesando reembolso en Stripe:", stripeError);
        // Continuar con la cancelación aunque falle el reembolso
      }
    }

    // Actualizar reserva
    await prisma.reservation.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        refundAmount,
        refundStatus,
        cancellationNotes: `Cancelado ${hoursUntilReservation.toFixed(1)}h antes. Reembolso: ${refundPercentage}%`,
      },
    });

    // Enviar email de confirmación de cancelación
    await sendCancellationConfirmation({
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
      refundAmount: refundAmount > 0 ? refundAmount : undefined,
      refundStatus,
    });

    return NextResponse.json({
      success: true,
      refundAmount,
      refundPercentage,
      hoursUntilReservation: hoursUntilReservation.toFixed(1),
    });
  } catch (error: any) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      { error: error.message || "Error cancelando reserva" },
      { status: 500 }
    );
  }
}
