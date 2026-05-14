/**
 * POST /api/redsys/notify — MerchantURL
 * Redsys llama aquí servidor-a-servidor tras procesar la preautorización.
 * Valida la firma, actualiza la reserva y envía el email correspondiente.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeMerchantParams, verifyRedsysSignature, isRedsysApproved } from "@/lib/redsys";
import { sendReservationConfirmation, sendReservationRejected } from "@/lib/email";

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

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: approved ? "CONFIRMED" : "CANCELLED",
        redsysStatus: approved ? "PREAUTHORIZED" : "REJECTED",
        redsysAuthCode: authCode,
        redsysResponse: dsResponse,
        confirmedAt: approved ? new Date() : undefined,
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
    };

    if (approved) {
      await sendReservationConfirmation(emailData).catch((e) =>
        console.error("[Redsys Notify] Error enviando email confirmación:", e)
      );
      console.log(`[Redsys Notify] ✅ Preautorización OK | orden=${order} | reserva=${reservation.id}`);
    } else {
      await sendReservationRejected(emailData).catch((e) =>
        console.error("[Redsys Notify] Error enviando email rechazo:", e)
      );
      console.log(`[Redsys Notify] ❌ Rechazado | orden=${order} | respuesta=${dsResponse}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Redsys Notify] Error:", error);
    return new Response("KO", { status: 500 });
  }
}
