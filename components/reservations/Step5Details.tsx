"use client";

/**
 * Paso 5: Datos personales + pago/bono regalo
 *
 * Flujo con bono regalo:
 *  - Bono cubre el total → reserva gratis, sin Redsys (POST /api/reservations/free)
 *  - Bono cubre parte    → Redsys solo por la diferencia (30% de lo que resta)
 *  - Sin bono            → Redsys 30% del total estimado (preautorización)
 */

import { useState } from "react";
import type { ReservationState } from "@/app/reservas/ReservasClient";
import { calcOrderTotal, formatHarmonySummary } from "@/lib/menus";

interface Step5DetailsProps {
  reservationData: ReservationState;
  onBack: () => void;
}

interface GiftCardInfo {
  giftCardId: string;
  available: number;
  discount: number;
  remaining: number;
  fullyCovered: boolean;
  menuName: string | null;
  numberOfPeople: number;
  message: string;
}

const allergensList = [
  "Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja",
  "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Sulfitos",
  "Altramuces", "Moluscos",
];

/**
 * Crea un formulario HTML dinámicamente y lo envía a Redsys.
 * Más fiable que React state + useEffect porque no depende del ciclo de render.
 */
function submitRedsysForm(data: {
  url: string;
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.url;
  form.style.display = "none";

  const addField = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField("Ds_SignatureVersion", data.Ds_SignatureVersion);
  addField("Ds_MerchantParameters", data.Ds_MerchantParameters);
  addField("Ds_Signature", data.Ds_Signature);

  document.body.appendChild(form);
  form.submit();
}

export default function Step5Details({ reservationData, onBack }: Step5DetailsProps) {
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
    noAllergens: false,
    giftCardCode: "",
    acceptTerms: false,
    acceptRedsysPolicy: false,
  });

  const [giftCardInfo, setGiftCardInfo] = useState<GiftCardInfo | null>(null);
  const [giftCardApplied, setGiftCardApplied] = useState(false);

  // ── Cálculo de importes ────────────────────────────────────────────────────
  const harmony = {
    none: reservationData.harmonyNone,
    vino: reservationData.harmonyVino,
    nolo: reservationData.harmonyNolo,
  };
  const menuTotal = reservationData.menuId
    ? calcOrderTotal(reservationData.menuId, reservationData.numberOfPeople, harmony)
    : 0;
  const giftDiscount = giftCardInfo?.discount ?? 0;
  const remainingAfterGift = Math.max(0, menuTotal - giftDiscount);
  const depositAmount = remainingAfterGift * 0.3; // 30% de lo que queda
  const isFreeReservation = giftCardInfo?.fullyCovered === true;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllergenToggle = (allergen: string) => {
    const newAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter((a) => a !== allergen)
      : [...formData.allergens, allergen];
    setFormData({ ...formData, allergens: newAllergens, noAllergens: false });
  };

  const handleApplyGiftCard = async () => {
    if (!formData.giftCardCode.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/giftcards/redeem-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.giftCardCode.trim().toUpperCase(),
          estimatedTotal: menuTotal,
          menuName: reservationData.menuName,
          numberOfPeople: reservationData.numberOfPeople,
          harmonyNone: reservationData.harmonyNone,
          harmonyVino: reservationData.harmonyVino,
          harmonyNolo: reservationData.harmonyNolo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setGiftCardInfo(data);
        setGiftCardApplied(true);
        setError(null);
      } else {
        setError(data.message || "Código de bono no válido");
      }
    } catch {
      setError("Error al validar el bono regalo");
    }
  };

  const handleRemoveGiftCard = () => {
    setGiftCardInfo(null);
    setGiftCardApplied(false);
    setFormData({ ...formData, giftCardCode: "" });
  };

  // ── Envío del formulario ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      setError("Debe aceptar los términos y condiciones");
      return;
    }
    if (formData.allergens.length === 0 && !formData.noAllergens) {
      setError("Por favor, indique sus alergias o confirme que no tiene ninguna.");
      return;
    }
    if (!isFreeReservation && !formData.acceptRedsysPolicy) {
      setError("Debe aceptar la política de retención del 30%");
      return;
    }
    if (menuTotal <= 0) {
      setError("No se ha podido calcular el importe. Vuelve atrás y selecciona un menú.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const payload = {
      ...formData,
      date: reservationData.date,
      time: reservationData.time,
      numberOfPeople: reservationData.numberOfPeople,
      menuId: reservationData.menuId,
      menuName: reservationData.menuName,
      menuPrice: reservationData.menuBasePrice,
      harmonyNone: reservationData.harmonyNone,
      harmonyVino: reservationData.harmonyVino,
      harmonyNolo: reservationData.harmonyNolo,
      estimatedTotal: menuTotal,
      depositAmount: isFreeReservation ? 0 : depositAmount,
      giftCardId: giftCardInfo?.giftCardId ?? null,
      giftCardDiscount: giftDiscount,
    };

    try {
      // ── Reserva cubierta totalmente por bono regalo → sin pago ────────────
      if (isFreeReservation) {
        const res = await fetch("/api/reservations/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Error confirmando la reserva");
        }
        const { reservationId } = await res.json();
        window.location.href = `/reservas/ok?reservationId=${reservationId}`;
        return;
      }

      // ── Reserva con pago parcial o total → Redsys ─────────────────────────
      const res = await fetch("/api/redsys/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error preparando el pago");
      }
      const { redsysForm, amountCents, depositEuros, estimatedTotal } = await res.json();

      // Verificación cliente: decodificar y comprobar el importe antes de enviar a Redsys
      try {
        const decoded = JSON.parse(atob(redsysForm.Ds_MerchantParameters));
        console.log("[Redsys] Parámetros verificados:", decoded);
        console.log(`[Redsys] Importe en céntimos: ${decoded.DS_MERCHANT_AMOUNT} | Pedido: ${decoded.DS_MERCHANT_ORDER}`);
        if (!decoded.DS_MERCHANT_AMOUNT || decoded.DS_MERCHANT_AMOUNT === "0") {
          throw new Error(`Importe inválido en parámetros Redsys: ${decoded.DS_MERCHANT_AMOUNT}`);
        }
      } catch (decodeErr) {
        console.error("[Redsys] Error verificando parámetros:", decodeErr);
        throw new Error("Error preparando el pago. Por favor, inténtalo de nuevo.");
      }

      // Envío directo al TPV — sin pasar por React state para evitar timing issues
      submitRedsysForm(redsysForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error procesando la reserva";
      setError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2 className="text-3xl font-serif font-light mb-8">Datos de la reserva</h2>

        {/* ── Resumen ──────────────────────────────────────────────────────── */}
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
              <span className="font-semibold text-right">{reservationData.menuName || "No seleccionado"}</span>
            </div>
            {(reservationData.harmonyVino > 0 || reservationData.harmonyNolo > 0) && (
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Armonía</span>
                <span className="font-semibold text-right text-sm">{formatHarmonySummary(harmony)}</span>
              </div>
            )}
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Comensales</span>
              <span className="font-semibold">{reservationData.numberOfPeople} personas</span>
            </div>
            <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-200">
              <span>Total estimado</span>
              <span>{menuTotal.toFixed(2)}€</span>
            </div>

            {giftDiscount > 0 && (
              <div className="flex justify-between text-green-700 pb-3 border-b border-gray-200">
                <span>Bono regalo aplicado</span>
                <span className="font-semibold">−{giftDiscount.toFixed(2)}€</span>
              </div>
            )}

            {isFreeReservation ? (
              <div className="flex justify-between text-green-800 font-bold text-base pt-1">
                <span>Total a pagar</span>
                <span className="text-green-600">0,00€ — Cubierto por bono</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-lg font-semibold pt-2 pb-3 border-b border-gray-200">
                  <span>Retención garantía (30%)</span>
                  <span className="text-primary">{depositAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Resto a pagar en el restaurante</span>
                  <span>{(remainingAfterGift - depositAmount).toFixed(2)}€</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Aviso de pago / bono ─────────────────────────────────────────── */}
        {isFreeReservation ? (
          <div className="bg-green-50 border border-green-300 p-5 mb-8 text-sm">
            <p className="font-semibold text-green-900 mb-1">Reserva cubierta por bono regalo</p>
            <p className="text-green-800">
              Tu bono regalo cubre el importe completo. No se realizará ningún cargo en tu tarjeta.
              La reserva quedará confirmada directamente.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 p-5 mb-8 text-sm">
            <p className="font-semibold text-blue-900 mb-2">Garantía de reserva — Preautorización bancaria</p>
            <p className="text-blue-800 leading-relaxed">
              Se realizará una <strong>retención del 30% ({depositAmount.toFixed(2)}€)</strong> en
              su tarjeta como garantía. <strong>No es un cobro</strong> — el importe queda bloqueado
              pero no se descuenta hasta que el restaurante lo confirme.
            </p>
            <ul className="mt-3 space-y-1 text-blue-700">
              <li>✓ Si acude a su reserva: la retención se libera automáticamente.</li>
              <li>✓ Si cancela con más de 24 horas: la retención se libera sin cargo.</li>
              <li>✗ Si cancela con menos de 24 horas o no se presenta: se podrá confirmar el cobro de la garantía.</li>
            </ul>
          </div>
        )}

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

          {/* Código de bono regalo */}
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">
              Código de bono regalo
            </label>
            {giftCardApplied && giftCardInfo ? (
              <div className="bg-green-50 border border-green-300 p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-800">{giftCardInfo.message}</p>
                  {giftCardInfo.menuName && (
                    <p className="text-xs text-green-700">
                      Menú: <strong>{giftCardInfo.menuName}</strong>
                    </p>
                  )}
                  {giftCardInfo.numberOfPeople > 0 && (
                    <p className="text-xs text-green-700">
                      Cubre: <strong>{giftCardInfo.numberOfPeople} {giftCardInfo.numberOfPeople === 1 ? "persona" : "personas"}</strong>
                      {" · "}Valor: <strong>{giftCardInfo.available.toFixed(2)}€</strong>
                    </p>
                  )}
                </div>
                <button type="button" onClick={handleRemoveGiftCard} className="text-xs text-green-700 underline whitespace-nowrap hover:text-red-600">
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  name="giftCardCode"
                  value={formData.giftCardCode}
                  onChange={handleInputChange}
                  className="input-premium flex-grow uppercase"
                  placeholder="GUNNEN-XXXX-XXXX"
                />
                <button
                  type="button"
                  onClick={handleApplyGiftCard}
                  disabled={!formData.giftCardCode.trim()}
                  className="btn-secondary px-6 disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Observaciones</label>
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
            <label className="block text-sm tracking-wider uppercase text-gray-600 mb-1">
              Alergias e intolerancias <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-4">
              Marque todas las que apliquen o confirme que no tiene ninguna.
            </p>
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
              className="input-premium resize-none mb-3"
              placeholder="Notas adicionales sobre alergias..."
            />
            <label className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
              formData.noAllergens
                ? "bg-green-50 border-green-400"
                : formData.allergens.length === 0
                  ? "bg-amber-50 border-amber-300"
                  : "bg-gray-50 border-gray-200 opacity-50"
            }`}>
              <input
                type="checkbox"
                checked={formData.noAllergens}
                disabled={formData.allergens.length > 0}
                onChange={(e) => setFormData({ ...formData, noAllergens: e.target.checked })}
                className="w-4 h-4 flex-shrink-0"
              />
              <span className="text-sm font-medium">
                Confirmo que no tengo ninguna alergia ni intolerancia alimentaria
              </span>
            </label>
          </div>
        </div>

        {/* ── Checkboxes ───────────────────────────────────────────────────── */}
        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              required
            />
            <span className="text-sm text-gray-600">
              Acepto los{" "}
              <a href="/terminos" target="_blank" className="link-subtle text-primary">términos y condiciones</a>,
              la{" "}
              <a href="/politica-cancelacion" target="_blank" className="link-subtle text-primary">política de cancelación</a>{" "}
              y la{" "}
              <a href="/politica-devolucion" target="_blank" className="link-subtle text-primary">política de devolución</a>.
              He consultado los{" "}
              <a href="/datos-fiscales" target="_blank" className="link-subtle text-primary">datos fiscales del comercio</a>.
            </span>
          </label>

          {/* Solo mostrar checkbox Redsys si hay pago */}
          {!isFreeReservation && (
            <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 p-4">
              <input
                type="checkbox"
                checked={formData.acceptRedsysPolicy}
                onChange={(e) => setFormData({ ...formData, acceptRedsysPolicy: e.target.checked })}
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                required
              />
              <span className="text-sm text-amber-900 leading-relaxed">
                <strong>Acepto</strong> que GUNNEN realice una{" "}
                <strong>retención del 30% del importe ({depositAmount.toFixed(2)}€)</strong>{" "}
                en mi tarjeta como garantía. En caso de cancelación con menos de 24 horas o no
                presentación, autorizo el cobro de dicha garantía.
              </span>
            </label>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mb-6">{error}</div>
        )}

        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-secondary flex-1" disabled={isProcessing}>
            Atrás
          </button>
          <button
            type="submit"
            disabled={isProcessing || !formData.acceptTerms || (!isFreeReservation && !formData.acceptRedsysPolicy)}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isProcessing
              ? (isFreeReservation ? "Confirmando reserva..." : "Redirigiendo al banco...")
              : isFreeReservation
                ? "Confirmar reserva (bono regalo)"
                : `Retener ${depositAmount.toFixed(2)}€ y confirmar reserva`}
          </button>
        </div>

        {!isFreeReservation && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Será redirigido al TPV Virtual de Sabadell / Redsys para autorizar la retención de forma segura con 3D Secure.
          </p>
        )}
      </form>
    </>
  );
}
