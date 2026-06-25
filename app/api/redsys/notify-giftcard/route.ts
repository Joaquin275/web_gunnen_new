/**
 * POST /api/redsys/notify-giftcard
 * Endpoint MerchantURL para notificaciones de pago de bonos regalo.
 * Redsys llama a este endpoint server-to-server tras el pago.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyRedsysSignature,
  decodeMerchantParams,
  isRedsysApproved,
} from "@/lib/redsys";
import { sendGiftCard, sendAdminGiftCardNotification } from "@/lib/email";
import { releaseGiftCardToPool } from "@/lib/giftcards-pool";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    const merchantParams = params.get("Ds_MerchantParameters") || "";
    const signature = params.get("Ds_Signature") || "";

    const secretKey = process.env.REDSYS_SECRET_KEY;
    if (!secretKey) {
      console.error("REDSYS_SECRET_KEY no configurada");
      return new NextResponse("KO", { status: 500 });
    }

    // Decodificar parámetros
    const decoded = decodeMerchantParams(merchantParams);
    const redsysOrder = decoded.Ds_Order || decoded.DS_MERCHANT_ORDER || "";
    const dsResponse = decoded.Ds_Response || decoded.DS_RESPONSE || "";
    const dsAuthCode = decoded.Ds_AuthorisationCode || "";

    // Verificar firma
    const signatureValid = verifyRedsysSignature(merchantParams, signature, redsysOrder, secretKey);
    if (!signatureValid) {
      console.error("Firma Redsys inválida en notify-giftcard");
      return new NextResponse("KO", { status: 400 });
    }

    // Buscar el bono por redsysOrder (guardado en stripePaymentIntentId)
    const giftCard = await prisma.giftCard.findFirst({
      where: { stripePaymentIntentId: redsysOrder },
    });

    if (!giftCard) {
      console.error("Bono no encontrado para redsysOrder:", redsysOrder);
      return new NextResponse("KO", { status: 404 });
    }

    const approved = isRedsysApproved(dsResponse);

    if (approved) {
      // Activar el bono
      const updated = await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          status: "ACTIVE",
          paidAt: new Date(),
        },
      });

      // Enviar PDF al destinatario
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sendDate = new Date(updated.sendDate);
      sendDate.setHours(0, 0, 0, 0);

      const expiresLabel = updated.expiresAt.toLocaleDateString("es-ES", {
        year: "numeric", month: "long", day: "numeric",
      });

      if (sendDate <= today) {
        const people = updated.numberOfPeople || 1;
        const totalAmount = Number(updated.amount);

        await sendGiftCard({
          recipientEmail: updated.recipientEmail,
          recipientName: updated.recipientName || undefined,
          purchaserName: updated.purchaserName,
          amount: totalAmount,
          numberOfPeople: people,
          menuName: updated.menuName || undefined,
          harmonyNone: updated.harmonyNone,
          harmonyVino: updated.harmonyVino,
          harmonyNolo: updated.harmonyNolo,
          code: updated.code,
          message: updated.message || undefined,
          expiresAt: expiresLabel,
        });

        await sendGiftCard({
          recipientEmail: updated.purchaserEmail,
          recipientName: updated.purchaserName,
          purchaserName: updated.purchaserName,
          amount: totalAmount,
          numberOfPeople: people,
          menuName: updated.menuName || undefined,
          harmonyNone: updated.harmonyNone,
          harmonyVino: updated.harmonyVino,
          harmonyNolo: updated.harmonyNolo,
          code: updated.code,
          message: `Copia de tu bono regalo para ${updated.recipientEmail}`,
          expiresAt: expiresLabel,
        });
      }

      await sendAdminGiftCardNotification({
        code: updated.code,
        amount: Number(updated.amount),
        menuName: updated.menuName || undefined,
        numberOfPeople: updated.numberOfPeople || 1,
        harmonyNone: updated.harmonyNone,
        harmonyVino: updated.harmonyVino,
        harmonyNolo: updated.harmonyNolo,
        purchaserName: updated.purchaserName,
        purchaserEmail: updated.purchaserEmail,
        recipientName: updated.recipientName || undefined,
        recipientEmail: updated.recipientEmail,
        message: updated.message || undefined,
        paidAt: updated.paidAt?.toLocaleString("es-ES") || new Date().toLocaleString("es-ES"),
      });

      console.log(`Bono ${updated.code} activado. Auth: ${dsAuthCode}`);
    } else {
      // Pago rechazado → devolver código al inventario
      await releaseGiftCardToPool(giftCard.id);
      console.log(`Bono cancelado por pago rechazado. Ds_Response: ${dsResponse}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error en /api/redsys/notify-giftcard:", error);
    return new NextResponse("KO", { status: 500 });
  }
}
