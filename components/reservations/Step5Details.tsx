"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReservationState } from "@/app/reservas/page";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Step5DetailsProps {
  reservationData: ReservationState;
  onBack: () => void;
}

// Lista de alérgenos comunes
const allergensList = [
  "Gluten",
  "Crustáceos",
  "Huevos",
  "Pescado",
  "Cacahuetes",
  "Soja",
  "Lácteos",
  "Frutos de cáscara",
  "Apio",
  "Mostaza",
  "Sésamo",
  "Sulfitos",
  "Altramuces",
  "Moluscos",
];

function CheckoutForm({ reservationData, onBack, clientSecret }: Step5DetailsProps & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    observations: "",
    allergens: [] as string[],
    allergenNotes: "",
    couponCode: "",
    acceptTerms: false,
  });

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Calcular señal del 30% sobre el total del menú
  const menuTotal = reservationData.menuPrice * reservationData.numberOfPeople;
  const depositTotal = menuTotal * 0.3; // 30% de señal
  const finalAmount = depositTotal - couponDiscount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllergenToggle = (allergen: string) => {
    const newAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter((a) => a !== allergen)
      : [...formData.allergens, allergen];
    setFormData({ ...formData, allergens: newAllergens });
  };

  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) return;

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.couponCode,
          amount: depositTotal,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
      } else {
        setError(data.message || "Cupón inválido");
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } catch (err) {
      setError("Error validando el cupón");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!formData.acceptTerms) {
      setError("Debe aceptar los términos y condiciones");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Crear la reserva en nuestro sistema
      const reservationResponse = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...reservationData,
          depositAmount: finalAmount,
        }),
      });

      if (!reservationResponse.ok) {
        throw new Error("Error creando la reserva");
      }

      const { reservationId } = await reservationResponse.json();

      // Confirmar el pago con Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/reservas/confirmacion?reservationId=${reservationId}`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Error procesando el pago");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "Error procesando la reserva");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-serif font-light mb-8">Datos de la reserva</h2>

      {/* Resumen */}
      <div className="bg-gray-50 p-6 mb-8">
        <h3 className="text-sm tracking-wider uppercase text-gray-600 mb-4">Resumen de la reserva</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Fecha</span>
            <span className="font-semibold">
              {new Date(reservationData.date + 'T00:00:00').toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Hora</span>
            <span className="font-semibold">{reservationData.time}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Menú seleccionado</span>
            <span className="font-semibold">{reservationData.menuName || "No seleccionado"}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Comensales</span>
            <span className="font-semibold">{reservationData.numberOfPeople} personas</span>
          </div>
          
          <div className="divider my-4" />
          
          {/* Cálculo de costes */}
          <div className="flex justify-between text-gray-600">
            <span>Menú ({reservationData.numberOfPeople} × {reservationData.menuPrice}€)</span>
            <span>{(reservationData.menuPrice * reservationData.numberOfPeople).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Señal (30%)</span>
            <span className="font-semibold">{depositTotal.toFixed(2)}€</span>
          </div>
          
          {couponDiscount > 0 && (
            <div className="flex justify-between text-accent pb-3 border-b border-gray-200">
              <span>Descuento cupón</span>
              <span className="font-semibold">-{couponDiscount.toFixed(2)}€</span>
            </div>
          )}
          
          <div className="flex justify-between text-xl font-semibold pt-2">
            <span>Total a pagar ahora</span>
            <span className="text-accent">{finalAmount.toFixed(2)}€</span>
          </div>
          
          <div className="text-xs text-gray-500 mt-3 bg-white p-3 rounded">
            <p>• La señal del 30% se paga ahora para confirmar la reserva</p>
            <p>• El resto ({((reservationData.menuPrice * reservationData.numberOfPeople) - depositTotal).toFixed(2)}€) se abona en el restaurante</p>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="input-premium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="input-premium"
            />
          </div>
        </div>

        {/* Cupón */}
        <div>
          <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
            Código de cupón
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="couponCode"
              value={formData.couponCode}
              onChange={handleInputChange}
              disabled={couponApplied}
              className="input-premium flex-grow"
              placeholder="Introduce tu código"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponApplied || !formData.couponCode.trim()}
              className="btn-secondary px-6 disabled:opacity-50"
            >
              {couponApplied ? "Aplicado ✓" : "Aplicar"}
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
            Observaciones
          </label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleInputChange}
            rows={3}
            className="input-premium resize-none"
            placeholder="Ocasión especial, preferencias de mesa, etc."
          />
        </div>

        {/* Alérgenos */}
        <div>
          <label className="block text-sm tracking-wider uppercase text-gray-600 mb-4">
            Alergias e intolerancias
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {allergensList.map((allergen) => (
              <label key={allergen} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allergens.includes(allergen)}
                  onChange={() => handleAllergenToggle(allergen)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{allergen}</span>
              </label>
            ))}
          </div>
          <textarea
            name="allergenNotes"
            value={formData.allergenNotes}
            onChange={handleInputChange}
            rows={2}
            className="input-premium resize-none"
            placeholder="Notas adicionales sobre alergias..."
          />
        </div>
      </div>

      {/* Pago con Stripe */}
      <div className="mb-8">
        <h3 className="text-xl font-serif font-light mb-6">Método de pago</h3>
        <PaymentElement />
      </div>

      {/* Términos */}
      <div className="mb-8">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="w-5 h-5 mt-1"
          />
          <span className="text-sm text-gray-600">
            Acepto los{" "}
            <a href="/terminos" target="_blank" className="link-subtle text-primary">
              términos y condiciones
            </a>{" "}
            y la{" "}
            <a href="/politica-cancelacion" target="_blank" className="link-subtle text-primary">
              política de cancelación
            </a>
            . Entiendo que se cobrará una señal del 30% que será reembolsada según la política vigente.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="btn-secondary flex-1" disabled={isProcessing}>
          Atrás
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing || !formData.acceptTerms}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {isProcessing ? "Procesando..." : `Pagar ${finalAmount.toFixed(2)}€`}
        </button>
      </div>
    </form>
  );
}

export default function Step5Details(props: Step5DetailsProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    // Crear PaymentIntent al montar el componente
    const menuTotal = props.reservationData.menuPrice * props.reservationData.numberOfPeople;
    const depositAmount = menuTotal * 0.3; // 30% de señal
    
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: depositAmount,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error creating payment intent:", err);
        setLoading(false);
      });
  });

  if (loading || !clientSecret) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Preparando formulario de pago...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
}
