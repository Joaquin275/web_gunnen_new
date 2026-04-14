import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendGiftCard } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent");
    const giftCardId = searchParams.get("giftCardId");

    if (!paymentIntentId || !giftCardId) {
      return NextResponse.json(
        { success: false, error: "Parámetros requeridos" },
        { status: 400 }
      );
    }

    // Verificar el estado en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Actualizar el bono regalo
      const giftCard = await prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          status: "ACTIVE",
          stripePaymentIntentId: paymentIntentId,
          paidAt: new Date(),
        },
      });

      // Si la fecha de envío es hoy, enviar el email
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sendDate = new Date(giftCard.sendDate);
      sendDate.setHours(0, 0, 0, 0);

      if (sendDate <= today) {
        await sendGiftCard({
          recipientEmail: giftCard.recipientEmail,
          recipientName: giftCard.recipientName || undefined,
          purchaserName: giftCard.purchaserName,
          amount: Number(giftCard.amount),
          code: giftCard.code,
          message: giftCard.message || undefined,
          expiresAt: giftCard.expiresAt.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });

        // También enviar copia al comprador
        await sendGiftCard({
          recipientEmail: giftCard.purchaserEmail,
          recipientName: giftCard.purchaserName,
          purchaserName: giftCard.purchaserName,
          amount: Number(giftCard.amount),
          code: giftCard.code,
          message: `Copia de tu bono regalo para ${giftCard.recipientEmail}`,
          expiresAt: giftCard.expiresAt.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });
      }

      return NextResponse.json({
        success: true,
        giftCard,
      });
    }

    return NextResponse.json({
      success: false,
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error("Error verifying gift card payment:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
