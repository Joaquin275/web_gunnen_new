import { NextResponse } from "next/server";
import { stripe, formatAmountForStripe, STRIPE_CURRENCY } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Importe inválido" },
        { status: 400 }
      );
    }

    // Crear PaymentIntent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: "reservation_deposit",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Error creando intención de pago" },
      { status: 500 }
    );
  }
}
