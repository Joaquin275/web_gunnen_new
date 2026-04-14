"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import GiftCardForm from "@/components/giftcards/GiftCardForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const suggestedAmounts = [100, 150, 200];

export default function RegalaPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [step, setStep] = useState<"amount" | "form">("amount");

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
    }
  };

  const handleContinue = async () => {
    if (selectedAmount < 50 || selectedAmount > 500) {
      alert("El importe debe estar entre 50€ y 500€");
      return;
    }

    // Crear PaymentIntent
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setStep("form");
    } catch (error) {
      console.error("Error creating payment intent:", error);
      alert("Error preparando el pago. Inténtelo de nuevo.");
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-display font-serif font-light mb-6">
              Regala una experiencia
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Nuestros bonos regalo son la forma perfecta de compartir momentos
              únicos. Válidos durante 12 meses desde su emisión.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12">
            {step === "amount" && (
              <div>
                <h2 className="text-3xl font-serif font-light mb-8">
                  Seleccione el importe
                </h2>

                {/* Importes sugeridos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {suggestedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-8 border-2 transition-all ${
                        selectedAmount === amount && !customAmount
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-4xl font-serif font-light mb-2">
                        {amount}€
                      </div>
                      <div className="text-sm tracking-wider uppercase opacity-75">
                        {amount === 100 && "Bono inicial"}
                        {amount === 150 && "Bono premium"}
                        {amount === 200 && "Experiencia completa"}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Importe personalizado */}
                <div className="mb-8">
                  <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
                    O introduce un importe personalizado
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max="500"
                      step="10"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Ej: 175"
                      className="input-premium pr-8"
                    />
                    <span className="absolute right-0 top-3 text-gray-400">€</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Mínimo 50€ — Máximo 500€
                  </p>
                </div>

                {/* Beneficios */}
                <div className="bg-gray-50 p-6 mb-8">
                  <h3 className="text-sm tracking-wider uppercase text-gray-600 mb-4">
                    Incluye
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-accent rounded-full mt-2.5 mr-3 flex-shrink-0" />
                      <span>Válido durante 12 meses desde su emisión</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-accent rounded-full mt-2.5 mr-3 flex-shrink-0" />
                      <span>Código único personalizado</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-accent rounded-full mt-2.5 mr-3 flex-shrink-0" />
                      <span>Email personalizado al destinatario</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-accent rounded-full mt-2.5 mr-3 flex-shrink-0" />
                      <span>Opción de programar envío en fecha futura</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-accent rounded-full mt-2.5 mr-3 flex-shrink-0" />
                      <span>Canjeable en cualquier reserva</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedAmount || selectedAmount < 50 || selectedAmount > 500}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  Continuar con {selectedAmount}€
                </button>
              </div>
            )}

            {step === "form" && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <GiftCardForm
                  amount={selectedAmount}
                  clientSecret={clientSecret}
                  onBack={() => setStep("amount")}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
