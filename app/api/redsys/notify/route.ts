/**
 * POST /api/redsys/notify — MerchantURL
 * Redsys llama aquí servidor-a-servidor tras procesar la preautorización.
 * Valida la firma, actualiza la reserva y envía el email correspondiente.
 */

import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { decodeMerchantParams, verifyRedsysSignature, isRedsysApproved } from "@/lib/redsys";
import {
  notifyReservationConfirmed,
  notifyReservationRejected,
  sendReservationReminder,
  type ReservationEmailData,
} from "@/lib/email";
import { madridDateKey, addDaysToDateKey } from "@/lib/timezone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const merchantParameters = params.get("Ds_MerchantParameters");
    const signature = params.get("Ds_Signature");

    if (!merchantParameters || !signature) {
      return new Response("KO", { status: 400 });
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    if (!secretKey) return new Response("KO", { status: 500 });

    let decoded: Record<string, string>;
    try {
      decoded = decodeMerchantParams(merchantParameters);
    } catch {
      return new Response("KO", { status: 400 });
    }

    const order = decoded.Ds_Order;
    const dsResponse = decoded.Ds_Response || "9999";
    const authCode = decoded.Ds_AuthorisationCode || "";

    if (!order) return new Response("KO", { status: 400 });

    if (!verifyRedsysSignature(merchantParameters, signature, order, secretKey)) {
      console.error(`[Redsys Notify] Firma inválida para orden ${order}`);
      return new Response("KO", { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { redsysOrder: order },
    });

    if (!reservation) {
      console.warn(`[Redsys Notify] Reserva no encontrada para orden ${order}`);
      return new Response("OK", { status: 200 });
    }

    const approved = isRedsysApproved(dsResponse);

    // Generar token único de confirmación de asistencia
    const attendanceToken = approved
      ? randomBytes(32).toString("hex")
      : undefined;

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: approved ? "CONFIRMED" : "CANCELLED",
        redsysStatus: approved ? "PREAUTHORIZED" : "REJECTED",
        redsysAuthCode: authCode,
        redsysResponse: dsResponse,
        confirmedAt: approved ? new Date() : undefined,
        ...(attendanceToken ? { attendanceToken } : {}),
      },
    });

    // ── Enviar email según resultado ────────────────────────────────────────
    const emailData = {
      reservationId: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      reservationDate: updated.reservationDate,
      reservationTime: updated.reservationTime,
      numberOfPeople: updated.numberOfPeople,
      menuName: updated.menuName ?? undefined,
      estimatedTotal: Number(updated.estimatedTotal),
      depositAmount: Number(updated.depositAmount),
      redsysOrder: updated.redsysOrder ?? undefined,
      allergens: (updated.allergens as string[]) ?? [],
      allergenNotes: updated.allergenNotes ?? undefined,
    };

    if (approved) {
      await notifyReservationConfirmed(emailData).catch((e) =>
        console.error("[Redsys Notify] Error enviando emails confirmación:", e)
      );

      // ── Recordatorio inmediato si la reserva es hoy o mañana ────────────────
      // (el cron diario puede haberse ejecutado ANTES de que se creara la reserva)
      const reservationDateKey = updated.reservationDate.toISOString().slice(0, 10);
      const todayKey    = madridDateKey();
      const tomorrowKey = addDaysToDateKey(todayKey, 1);

      const reminderData: ReservationEmailData = {
        reservationId: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        reservationDate: updated.reservationDate,
        reservationTime: updated.reservationTime,
        numberOfPeople: updated.numberOfPeople,
        menuName: updated.menuName ?? undefined,
        estimatedTotal: Number(updated.estimatedTotal),
        depositAmount: Number(updated.depositAmount),
        attendanceToken: updated.attendanceToken ?? undefined,
      };

      if (reservationDateKey === tomorrowKey && !updated.reminder24hSentAt) {
        // Reserva para mañana confirmada hoy → recordatorio 24h ahora
        sendReservationReminder(reminderData, "24h")
          .then(() =>
            prisma.reservation.update({
              where: { id: updated.id },
              data: { reminder24hSentAt: new Date() },
            })
          )
          .catch((e) =>
            console.error("[Redsys Notify] Error enviando recordatorio 24h:", e)
          );
      } else if (reservationDateKey === todayKey && !updated.reminderSameDaySentAt) {
        // Reserva para hoy confirmada tarde → recordatorio mismo día ahora
        sendReservationReminder(reminderData, "same_day")
          .then(() =>
            prisma.reservation.update({
              where: { id: updated.id },
              data: { reminderSameDaySentAt: new Date() },
            })
          )
          .catch((e) =>
            console.error("[Redsys Notify] Error enviando recordatorio mismo día:", e)
          );
      }

      console.log(`[Redsys Notify] ✅ Preautorización OK | orden=${order} | reserva=${reservation.id}`);
    } else {
      await notifyReservationRejected(emailData).catch((e) =>
        console.error("[Redsys Notify] Error enviando emails rechazo:", e)
      );
      console.log(`[Redsys Notify] ❌ Rechazado | orden=${order} | respuesta=${dsResponse}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Redsys Notify] Error:", error);
    return new Response("KO", { status: 500 });
  }
}
