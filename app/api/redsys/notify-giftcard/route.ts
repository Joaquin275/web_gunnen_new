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
      console.error("[GiftCard Notify] REDSYS_SECRET_KEY no configurada");
      return new NextResponse("KO", { status: 500 });
    }

    const decoded = decodeMerchantParams(merchantParams);
    const redsysOrder = decoded.Ds_Order || decoded.DS_MERCHANT_ORDER || "";
    const dsResponse = decoded.Ds_Response || decoded.DS_RESPONSE || "";
    const dsAuthCode = decoded.Ds_AuthorisationCode || "";

    const signatureValid = verifyRedsysSignature(merchantParams, signature, redsysOrder, secretKey);
    if (!signatureValid) {
      console.error("[GiftCard Notify] Firma Redsys inválida");
      return new NextResponse("KO", { status: 400 });
    }

    const giftCard = await prisma.giftCard.findFirst({
      where: { stripePaymentIntentId: redsysOrder },
    });

    if (!giftCard) {
      console.error("[GiftCard Notify] Bono no encontrado para redsysOrder:", redsysOrder);
      return new NextResponse("KO", { status: 404 });
    }

    const approved = isRedsysApproved(dsResponse);

    if (approved) {
      const updated = await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { status: "ACTIVE", paidAt: new Date() },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sendDate = new Date(updated.sendDate);
      sendDate.setHours(0, 0, 0, 0);

      const expiresLabel = updated.expiresAt.toLocaleDateString("es-ES", {
        year: "numeric", month: "long", day: "numeric",
      });

      const people = updated.numberOfPeople || 1;
      const totalAmount = Number(updated.amount);
      const commonData = {
        amount: totalAmount,
        numberOfPeople: people,
        menuName: updated.menuName || undefined,
        harmonyNone: updated.harmonyNone,
        harmonyVino: updated.harmonyVino,
        harmonyNolo: updated.harmonyNolo,
        code: updated.code,
        expiresAt: expiresLabel,
      };

      // ── Email al destinatario ────────────────────────────────────────────
      if (sendDate <= today) {
        try {
          await sendGiftCard({
            ...commonData,
            recipientEmail: updated.recipientEmail,
            recipientName: updated.recipientName || undefined,
            purchaserName: updated.purchaserName,
            message: updated.message || undefined,
          });
          console.log(`[GiftCard Notify] Email enviado al destinatario: ${updated.recipientEmail}`);
        } catch (err) {
          console.error("[GiftCard Notify] ERROR enviando email al destinatario:", err);
        }

        // ── Copia al comprador (solo si email distinto al destinatario) ────
        if (updated.purchaserEmail !== updated.recipientEmail) {
          try {
            await sendGiftCard({
              ...commonData,
              recipientEmail: updated.purchaserEmail,
              recipientName: updated.purchaserName,
              purchaserName: updated.purchaserName,
              message: `Copia de tu bono regalo para ${updated.recipientEmail}`,
            });
            console.log(`[GiftCard Notify] Copia enviada al comprador: ${updated.purchaserEmail}`);
          } catch (err) {
            console.error("[GiftCard Notify] ERROR enviando copia al comprador:", err);
          }
        } else {
          // Si son el mismo email, enviar un único correo (no duplicar)
          console.log(`[GiftCard Notify] Comprador y destinatario son el mismo email, no se duplica`);
        }
      } else {
        console.log(`[GiftCard Notify] Bono programado para ${sendDate.toISOString().slice(0, 10)}, no se envía hoy`);
      }

      // ── Notificación admin (siempre, independientemente de sendDate) ────
      try {
        await sendAdminGiftCardNotification({
          code: updated.code,
          amount: totalAmount,
          menuName: updated.menuName || undefined,
          numberOfPeople: people,
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
        console.log(`[GiftCard Notify] Notificación admin enviada para bono ${updated.code}`);
      } catch (err) {
        console.error("[GiftCard Notify] ERROR enviando notificación admin:", err);
      }

      console.log(`[GiftCard Notify] Bono ${updated.code} activado. Auth: ${dsAuthCode}`);
    } else {
      await releaseGiftCardToPool(giftCard.id);
      console.log(`[GiftCard Notify] Bono cancelado por pago rechazado. Ds_Response: ${dsResponse}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[GiftCard Notify] Error general:", error);
    return new NextResponse("KO", { status: 500 });
  }
}
