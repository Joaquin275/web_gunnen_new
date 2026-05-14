"use client";

/**
 * Paso 5 del asistente de reservas: Datos personales + preautorización Redsys
 *
 * Flujo:
 *  1. Cliente rellena datos personales, alergias, observaciones.
 *  2. Acepta la política de cancelación (retención 30%).
 *  3. Se llama a /api/redsys/prepare que crea la reserva (PENDING_PAYMENT)
 *     y devuelve los parámetros firmados para el TPV Virtual.
 *  4. Se auto-envía un formulario HTML oculto al TPV Virtual Redsys.
 *  5. Redsys procesa la PREAUTORIZACIÓN (TransactionType=1 → retención, no cobro).
 *  6. Redsys redirige a /reservas/ok o /reservas/ko.
 */

import { useState, useRef, useEffect } from "react";
import type { ReservationState } from "@/app/reservas/page";

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
  const redsysFormRef = useRef<HTMLFormElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [redsysData, setRedsysData] = useState<{
    url: string;
    Ds_SignatureVersion: string;
    Ds_MerchantParameters: string;
    Ds_Signature: string;
  } | null>(null);

  // Auto-envía el formulario oculto en cuanto redsysData esté en el DOM
  useEffect(() => {
    if (redsysData && redsysFormRef.current) {
      redsysFormRef.current.submit();
    }
  }, [redsysData]);

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
    acceptRedsysPolicy: false, // ← Obligatorio: política de retención 30%
  });

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // ── Cálculo de importes ─────────────────────────────────────────────────
  const menuTotal = reservationData.menuPrice * reservationData.numberOfPeople;
  const depositTotal = menuTotal * 0.3; // 30% para retención Redsys
  const finalDeposit = Math.max(0, depositTotal - couponDiscount);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.includes(allergen)
        ? formData.allergens.filter((a) => a !== allergen)
        : [...formData.allergens, allergen],
    });
  };

  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.couponCode, amount: depositTotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        setError(null);
      } else {
        setError(data.message || "Cupón inválido");
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
    if (!formData.acceptRedsysPolicy) {
      setError(
        "Debe aceptar la política de retención del 30% para confirmar la reserva"
      );
      return;
    }

    // Validar que hay importe antes de ir a Redsys
    if (reservationData.menuPrice <= 0) {
      setError("No se ha podido calcular el importe. Vuelve atrás y selecciona un menú.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // ── Paso 1: crear reserva PENDING y obtener parámetros Redsys ──────
      const res = await fetch("/api/redsys/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: reservationData.date,
          time: reservationData.time,
          numberOfPeople: reservationData.numberOfPeople,
          menuName: reservationData.menuName,
          menuPrice: reservationData.menuPrice,
          depositAmount: finalDeposit,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error preparando el pago");
      }

      const { redsysForm } = await res.json();

      // ── Paso 2: guardar datos — useEffect se encarga del submit ────────
      setRedsysData(redsysForm);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error procesando la reserva";
      setError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* ── Formulario oculto que se auto-envía al TPV Virtual Redsys ───── */}
      {redsysData && (
        <form
          ref={redsysFormRef}
          method="POST"
          action={redsysData.url}
          style={{ display: "none" }}
        >
          <input type="hidden" name="Ds_SignatureVersion" value={redsysData.Ds_SignatureVersion} readOnly />
          <input type="hidden" name="Ds_MerchantParameters" value={redsysData.Ds_MerchantParameters} readOnly />
          <input type="hidden" name="Ds_Signature" value={redsysData.Ds_Signature} readOnly />
        </form>
      )}

      {/* ── Formulario visible al cliente ─────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <h2 className="text-3xl font-serif font-light mb-8">
          Datos de la reserva
        </h2>

        {/* Resumen */}
        <div className="bg-gray-50 p-6 mb-8">
          <h3 className="text-sm tracking-wider uppercase text-gray-600 mb-4">
            Resumen
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Fecha</span>
              <span className="font-semibold">
                {new Date(reservationData.date + "T00:00:00").toLocaleDateString(
                  "es-ES",
                  { weekday: "short", day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Hora</span>
              <span className="font-semibold">{reservationData.time}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Menú</span>
              <span className="font-semibold">
                {reservationData.menuName || "No seleccionado"}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Comensales</span>
              <span className="font-semibold">
                {reservationData.numberOfPeople} personas
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>
                Total estimado ({reservationData.numberOfPeople} ×{" "}
                {reservationData.menuPrice}€)
              </span>
              <span>{menuTotal.toFixed(2)}€</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-700 pb-3 border-b border-gray-200">
                <span>Descuento cupón</span>
                <span className="font-semibold">
                  -{couponDiscount.toFixed(2)}€
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 pb-3 border-b border-gray-200">
              <span>Retención Redsys (30%)</span>
              <span className="text-primary">{finalDeposit.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Resto a pagar en el restaurante</span>
              <span>{(menuTotal - depositTotal).toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* ── Aviso de preautorización ─────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 p-5 mb-8 text-sm">
          <p className="font-semibold text-blue-900 mb-2">
            Garantía de reserva — Preautorización bancaria
          </p>
          <p className="text-blue-800 leading-relaxed">
            Se realizará una{" "}
            <strong>retención del 30% ({finalDeposit.toFixed(2)}€)</strong> en
            su tarjeta como garantía. Esta retención{" "}
            <strong>no es un cobro</strong> — el importe queda bloqueado pero no
            se descuenta de su cuenta hasta que el restaurante lo confirme.
          </p>
          <ul className="mt-3 space-y-1 text-blue-700">
            <li>
              ✓ Si acude a su reserva: la retención se libera automáticamente.
            </li>
            <li>
              ✓ Si cancela con más de 24 horas: la retención se libera sin cargo.
            </li>
            <li>
              ✗ Si cancela con menos de 24 horas o no se presenta: el restaurante
              podrá confirmar el cobro de la garantía.
            </li>
          </ul>
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
                <label
                  key={allergen}
                  className="flex items-center gap-2 cursor-pointer"
                >
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

        {/* ── Checkboxes de aceptación ────────────────────────────────── */}
        <div className="space-y-4 mb-8">
          {/* Términos generales */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              required
            />
            <span className="text-sm text-gray-600">
              Acepto los{" "}
              <a
                href="/terminos"
                target="_blank"
                className="link-subtle text-primary"
              >
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a
                href="/politica-cancelacion"
                target="_blank"
                className="link-subtle text-primary"
              >
                política de cancelación
              </a>
              .
            </span>
          </label>

          {/* Política de retención Redsys — OBLIGATORIO */}
          <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 p-4">
            <input
              type="checkbox"
              checked={formData.acceptRedsysPolicy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptRedsysPolicy: e.target.checked,
                })
              }
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              required
            />
            <span className="text-sm text-amber-900 leading-relaxed">
              <strong>Acepto</strong> que GUNNEN realice una{" "}
              <strong>
                retención del 30% del importe estimado de la reserva (
                {finalDeposit.toFixed(2)}€)
              </strong>{" "}
              en mi tarjeta como garantía. En caso de cancelación con menos de
              24 horas o no presentación, autorizo el cobro de dicha garantía.
            </span>
          </label>
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
            disabled={
              isProcessing ||
              !formData.acceptTerms ||
              !formData.acceptRedsysPolicy
            }
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isProcessing
              ? "Redirigiendo al banco..."
              : `Retener ${finalDeposit.toFixed(2)}€ y confirmar reserva`}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Será redirigido al TPV Virtual de Sabadell / Redsys para autorizar la
          retención de forma segura con 3D Secure.
        </p>
      </form>
    </>
  );
}
