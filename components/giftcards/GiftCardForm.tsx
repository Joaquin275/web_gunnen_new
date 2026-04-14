"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

interface GiftCardFormProps {
  amount: number;
  clientSecret: string;
  onBack: () => void;
}

export default function GiftCardForm({ amount, clientSecret, onBack }: GiftCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    purchaserName: "",
    purchaserEmail: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
    sendDate: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Crear el bono regalo en nuestro sistema
      const giftCardResponse = await fetch("/api/giftcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount,
        }),
      });

      if (!giftCardResponse.ok) {
        throw new Error("Error creando el bono regalo");
      }

      const { giftCardId } = await giftCardResponse.json();

      // Confirmar el pago con Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/regala/confirmacion?giftCardId=${giftCardId}`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Error procesando el pago");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "Error procesando la compra");
      setIsProcessing(false);
    }
  };

  // Mínima fecha es hoy
  const today = new Date().toISOString().split('T')[0];
  // Máxima fecha es 1 año
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-serif font-light mb-8">Datos del bono regalo</h2>

      {/* Resumen */}
      <div className="bg-gray-50 p-6 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-sm tracking-wider uppercase text-gray-600">
            Importe del bono
          </span>
          <span className="text-3xl font-serif font-light">{amount}€</span>
        </div>
      </div>

      {/* Datos del comprador */}
      <div className="mb-8">
        <h3 className="text-xl font-serif font-light mb-6">Tus datos</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              name="purchaserName"
              value={formData.purchaserName}
              onChange={handleInputChange}
              required
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Tu email *
            </label>
            <input
              type="email"
              name="purchaserEmail"
              value={formData.purchaserEmail}
              onChange={handleInputChange}
              required
              className="input-premium"
              placeholder="Recibirás una copia del bono"
            />
          </div>
        </div>
      </div>

      {/* Datos del destinatario */}
      <div className="mb-8">
        <h3 className="text-xl font-serif font-light mb-6">Datos del destinatario</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Nombre del destinatario
            </label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              className="input-premium"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Email del destinatario *
            </label>
            <input
              type="email"
              name="recipientEmail"
              value={formData.recipientEmail}
              onChange={handleInputChange}
              required
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Fecha de envío *
            </label>
            <input
              type="date"
              name="sendDate"
              value={formData.sendDate}
              onChange={handleInputChange}
              min={today}
              max={maxDateStr}
              required
              className="input-premium"
            />
            <p className="text-xs text-gray-500 mt-2">
              El bono se enviará por email en esta fecha
            </p>
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Mensaje personalizado
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className="input-premium resize-none"
              placeholder="Escribe un mensaje especial para acompañar tu regalo..."
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.message.length}/500 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Pago */}
      <div className="mb-8">
        <h3 className="text-xl font-serif font-light mb-6">Método de pago</h3>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1"
          disabled={isProcessing}
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {isProcessing ? "Procesando..." : `Pagar ${amount}€`}
        </button>
      </div>
    </form>
  );
}
