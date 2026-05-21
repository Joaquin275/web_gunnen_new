/**
 * POST /api/redsys/notify-capture — MerchantURL para CAPTURAS
 * Redsys llama aquí servidor-a-servidor tras confirmar la captura (TransactionType=3).
 * Actualiza el estado de la reserva a CAPTURED sin resetear a PREAUTHORIZED.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeMerchantParams, verifyRedsysSignature, isRedsysApproved } from "@/lib/redsys";

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
      console.error(`[Redsys Capture] Firma inválida para orden ${order}`);
      return new Response("KO", { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { redsysOrder: order },
    });

    if (!reservation) {
      console.warn(`[Redsys Capture] Reserva no encontrada para orden ${order}`);
      return new Response("OK", { status: 200 });
    }

    const approved = isRedsysApproved(dsResponse);

    if (approved) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          redsysStatus: "CAPTURED",
          redsysAuthCode: authCode,
          redsysResponse: dsResponse,
          redsysCapturedAt: new Date(),
        },
      });
      console.log(`[Redsys Capture] ✅ Captura OK | orden=${order} | reserva=${reservation.id}`);
    } else {
      // Captura rechazada — mantener como PREAUTHORIZED para reintentar
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          redsysStatus: "PREAUTHORIZED",
          redsysResponse: dsResponse,
        },
      });
      console.warn(`[Redsys Capture] ❌ Captura rechazada | orden=${order} | respuesta=${dsResponse}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Redsys Capture] Error:", error);
    return new Response("KO", { status: 500 });
  }
}
