import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY no está definida");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_CURRENCY = "eur";

// Helper para formatear cantidades
export function formatAmountForStripe(amount: number): number {
  // Stripe trabaja con centavos
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
