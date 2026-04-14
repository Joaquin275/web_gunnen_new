import Stripe from "stripe";

export const STRIPE_CURRENCY = "eur";

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}

// Instancia lazy — no se crea en módulo para evitar errores en build
let _stripe: Stripe | null = null;

function createStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_demo") {
    // En build/demo usamos una instancia con key vacía (no se llama en build)
    _stripe = new Stripe(key ?? "sk_test_placeholder", {
      apiVersion: "2025-02-24.acacia",
    });
  } else {
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    return (createStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
