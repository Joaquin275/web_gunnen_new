/**
 * POST /api/redsys/notify  ← MerchantURL
 *
 * Redsys llama a este endpoint servidor-a-servidor tras procesar el pago.
 * NO requiere sesión de usuario. Debe responder "OK" o "KO".
 *
 * Valida la firma, actualiza el estado de la reserva y registra el resultado.
 */

import { NextRequest } from "next/server";
import { reservationsDb } from "@/lib/db-json";
import {
  decodeMerchantParams,
  verifyRedsysSignature,
  isRedsysApproved,
} from "@/lib/redsys";

export async function POST(request: NextRequest) {
  try {
    // Redsys envía application/x-www-form-urlencoded
    const body = await request.text();
    const params = new URLSearchParams(body);

    const merchantParameters = params.get("Ds_MerchantParameters");
    const signature = params.get("Ds_Signature");

    if (!merchantParameters || !signature) {
      console.error("[Redsys Notify] Faltan Ds_MerchantParameters o Ds_Signature");
      return new Response("KO", { status: 400 });
    }

    const secretKey = process.env.REDSYS_SECRET_KEY;
    if (!secretKey) {
      console.error("[Redsys Notify] REDSYS_SECRET_KEY no configurada");
      return new Response("KO", { status: 500 });
    }

    // ── Decodificar parámetros ────────────────────────────────────────────
    let decoded: Record<string, string>;
    try {
      decoded = decodeMerchantParams(merchantParameters);
    } catch {
      console.error("[Redsys Notify] Error decodificando parámetros");
      return new Response("KO", { status: 400 });
    }

    const order = decoded.Ds_Order;
    const dsResponse = decoded.Ds_Response || "9999";
    const authCode = decoded.Ds_AuthorisationCode || "";

    if (!order) {
      console.error("[Redsys Notify] Ds_Order ausente en parámetros");
      return new Response("KO", { status: 400 });
    }

    // ── Verificar firma ───────────────────────────────────────────────────
    const signatureValid = verifyRedsysSignature(
      merchantParameters,
      signature,
      order,
      secretKey
    );

    if (!signatureValid) {
      console.error(`[Redsys Notify] Firma inválida para orden ${order}`);
      return new Response("KO", { status: 400 });
    }

    // ── Buscar reserva por redsysOrder ────────────────────────────────────
    const allReservations = reservationsDb.findAll();
    const reservation = allReservations.find((r) => r.redsysOrder === order);

    if (!reservation) {
      // Redsys puede reintentar la notificación; respondemos OK para evitar reintentos
      console.warn(`[Redsys Notify] Reserva no encontrada para orden ${order}`);
      return new Response("OK", { status: 200 });
    }

    // ── Actualizar estado según respuesta ────────────────────────────────
    const approved = isRedsysApproved(dsResponse);

    if (approved) {
      // Preautorización correcta: retención activa, no se ha cobrado
      reservationsDb.update(reservation.id, {
        status: "CONFIRMED",
        redsysStatus: "PREAUTHORIZED",
        redsysAuthCode: authCode,
        redsysResponse: dsResponse,
      });
      console.log(
        `[Redsys Notify] ✅ Preautorización OK | orden=${order} | reserva=${reservation.id} | auth=${authCode}`
      );
    } else {
      // Rechazado por el banco
      reservationsDb.update(reservation.id, {
        status: "CANCELLED",
        redsysStatus: "REJECTED",
        redsysResponse: dsResponse,
      });
      console.log(
        `[Redsys Notify] ❌ Rechazado | orden=${order} | respuesta=${dsResponse}`
      );
    }

    // Redsys espera exactamente "OK" en el body para confirmar recepción
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Redsys Notify] Error inesperado:", error);
    return new Response("KO", { status: 500 });
  }
}
