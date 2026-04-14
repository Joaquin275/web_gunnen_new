"use client";

import { useState } from "react";
import type { ReservationState } from "@/app/reservas/page";
import { useRouter } from "next/navigation";

interface Step5DetailsProps {
  reservationData: ReservationState;
  onBack: () => void;
}

const allergensList = [
  "Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja",
  "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Sulfitos",
  "Altramuces", "Moluscos",
];

export default function Step5Details({ reservationData, onBack }: Step5DetailsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const menuTotal = reservationData.menuPrice * reservationData.numberOfPeople;
  const depositTotal = menuTotal * 0.3;
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
        body: JSON.stringify({ code: formData.couponCode, amount: depositTotal }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        setError(null);
      } else {
        setError(data.message || "Cupón inválido");
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } catch {
      setError("Error validando el cupón");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("Debe aceptar los términos y condiciones");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...reservationData,
          depositAmount: finalAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error creando la reserva");
      }

      const { reservationId } = await response.json();
      router.push(`/reservas/confirmacion?reservationId=${reservationId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error procesando la reserva";
      setError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-serif font-light mb-8">Datos de la reserva</h2>

      {/* Resumen */}
      <div className="bg-gray-50 p-6 mb-8">
        <h3 className="text-sm tracking-wider uppercase text-gray-600 mb-4">Resumen</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Fecha</span>
            <span className="font-semibold">
              {new Date(reservationData.date + "T00:00:00").toLocaleDateString("es-ES", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Hora</span>
            <span className="font-semibold">{reservationData.time}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Menú</span>
            <span className="font-semibold">{reservationData.menuName || "No seleccionado"}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Comensales</span>
            <span className="font-semibold">{reservationData.numberOfPeople} personas</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Menú ({reservationData.numberOfPeople} × {reservationData.menuPrice}€)</span>
            <span>{menuTotal.toFixed(2)}€</span>
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
            <span>Señal a pagar</span>
            <span className="text-accent">{finalAmount.toFixed(2)}€</span>
          </div>
          <div className="text-xs text-gray-500 mt-3 bg-white p-3">
            <p>• La señal del 30% confirma su reserva y se abona al llegar al restaurante</p>
            <p>• El resto ({(menuTotal - depositTotal).toFixed(2)}€) se abona también en el restaurante</p>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Nombre *</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="input-premium" />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Apellidos *</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="input-premium" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="input-premium" />
          </div>
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Teléfono *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="input-premium" />
          </div>
        </div>

        {/* Cupón */}
        <div>
          <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Código de cupón</label>
          <div className="flex gap-2">
            <input type="text" name="couponCode" value={formData.couponCode} onChange={handleInputChange} disabled={couponApplied} className="input-premium flex-grow" placeholder="Introduce tu código" />
            <button type="button" onClick={handleApplyCoupon} disabled={couponApplied || !formData.couponCode.trim()} className="btn-secondary px-6 disabled:opacity-50">
              {couponApplied ? "Aplicado ✓" : "Aplicar"}
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Observaciones</label>
          <textarea name="observations" value={formData.observations} onChange={handleInputChange} rows={3} className="input-premium resize-none" placeholder="Ocasión especial, preferencias de mesa, etc." />
        </div>

        {/* Alérgenos */}
        <div>
          <label className="block text-sm tracking-wider uppercase text-gray-600 mb-4">Alergias e intolerancias</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {allergensList.map((allergen) => (
              <label key={allergen} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.allergens.includes(allergen)} onChange={() => handleAllergenToggle(allergen)} className="w-4 h-4" />
                <span className="text-sm">{allergen}</span>
              </label>
            ))}
          </div>
          <textarea name="allergenNotes" value={formData.allergenNotes} onChange={handleInputChange} rows={2} className="input-premium resize-none" placeholder="Notas adicionales sobre alergias..." />
        </div>
      </div>

      {/* Aviso pago en restaurante */}
      <div className="bg-amber-50 border border-amber-200 p-5 mb-8 text-sm text-amber-800">
        <p className="font-semibold mb-1">Pago en el restaurante</p>
        <p>La señal del 30% ({finalAmount.toFixed(2)}€) se abonará directamente en el restaurante el día de su visita. No se realizan cargos online en este momento.</p>
      </div>

      {/* Términos */}
      <div className="mb-8">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.acceptTerms} onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })} className="w-5 h-5 mt-1" />
          <span className="text-sm text-gray-600">
            Acepto los{" "}
            <a href="/terminos" target="_blank" className="link-subtle text-primary">términos y condiciones</a>{" "}
            y la{" "}
            <a href="/politica-cancelacion" target="_blank" className="link-subtle text-primary">política de cancelación</a>.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mb-6">{error}</div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="btn-secondary flex-1" disabled={isProcessing}>Atrás</button>
        <button type="submit" disabled={isProcessing || !formData.acceptTerms} className="btn-primary flex-1 disabled:opacity-50">
          {isProcessing ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </div>
    </form>
  );
}
