/**
 * POST /api/redsys/notify — MerchantURL
 * Redsys llama aquí servidor-a-servidor tras procesar el pago.
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

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: approved ? "CONFIRMED" : "CANCELLED",
        redsysStatus: approved ? "PREAUTHORIZED" : "REJECTED",
        redsysAuthCode: authCode,
        redsysResponse: dsResponse,
        confirmedAt: approved ? new Date() : undefined,
      },
    });

    console.log(`[Redsys Notify] orden=${order} | aprobado=${approved} | resp=${dsResponse}`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Redsys Notify] Error:", error);
    return new Response("KO", { status: 500 });
  }
}
