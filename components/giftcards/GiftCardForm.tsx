"use client";

import { useState, useRef, useEffect } from "react";

interface GiftCardFormProps {
  amount: number;
  menuName: string;
  onBack: () => void;
}

export default function GiftCardForm({ amount, menuName, onBack }: GiftCardFormProps) {
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

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    purchaserName: "",
    purchaserEmail: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
    sendDate: today,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Llama al endpoint que crea el bono PENDING y devuelve parámetros Redsys
      const res = await fetch("/api/redsys/giftcard-prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount, menuName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error preparando el pago");
      }

      const { redsysForm } = await res.json();
      // useEffect se encarga de enviar el formulario oculto a Redsys
      setRedsysData(redsysForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error procesando la solicitud";
      setError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Formulario oculto para Redsys */}
      {redsysData && (
        <form ref={redsysFormRef} method="POST" action={redsysData.url} style={{ display: "none" }}>
          <input type="hidden" name="Ds_SignatureVersion" value={redsysData.Ds_SignatureVersion} readOnly />
          <input type="hidden" name="Ds_MerchantParameters" value={redsysData.Ds_MerchantParameters} readOnly />
          <input type="hidden" name="Ds_Signature" value={redsysData.Ds_Signature} readOnly />
        </form>
      )}

      <form onSubmit={handleSubmit}>
        <h2 className="text-3xl font-serif font-light mb-8">Datos del bono regalo</h2>

        {/* Resumen del menú seleccionado */}
        <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">Menú seleccionado</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-serif font-light">{menuName}</span>
            <span className="text-2xl font-serif font-light">
              {amount}€<span className="text-sm text-gray-400 ml-1">/persona</span>
            </span>
          </div>
        </div>

        {/* Datos del comprador */}
        <div className="mb-8">
          <h3 className="text-xl font-serif font-light mb-6">Tus datos</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Tu nombre *</label>
              <input type="text" name="purchaserName" value={formData.purchaserName} onChange={handleInputChange} required className="input-premium" />
            </div>
            <div>
              <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Tu email *</label>
              <input type="email" name="purchaserEmail" value={formData.purchaserEmail} onChange={handleInputChange} required className="input-premium" placeholder="Recibirás una copia del bono" />
            </div>
          </div>
        </div>

        {/* Datos del destinatario */}
        <div className="mb-8">
          <h3 className="text-xl font-serif font-light mb-6">Datos del destinatario</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Nombre del destinatario</label>
              <input type="text" name="recipientName" value={formData.recipientName} onChange={handleInputChange} className="input-premium" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Email del destinatario *</label>
              <input type="email" name="recipientEmail" value={formData.recipientEmail} onChange={handleInputChange} required className="input-premium" />
            </div>
            <div>
              <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Fecha de envío *</label>
              <input type="date" name="sendDate" value={formData.sendDate} onChange={handleInputChange} min={today} max={maxDateStr} required className="input-premium" />
              <p className="text-xs text-gray-500 mt-2">El bono se enviará por email en esta fecha</p>
            </div>
            <div>
              <label className="block text-sm tracking-wider uppercase text-gray-600 mb-2">Mensaje personalizado</label>
              <textarea name="message" value={formData.message} onChange={handleInputChange} rows={4} maxLength={500} className="input-premium resize-none" placeholder="Escribe un mensaje especial para acompañar tu regalo..." />
              <p className="text-xs text-gray-500 mt-2">{formData.message.length}/500 caracteres</p>
            </div>
          </div>
        </div>

        {/* Aviso pago */}
        <div className="bg-blue-50 border border-blue-200 p-5 mb-8 text-sm text-blue-800">
          <p className="font-semibold mb-1">Pago seguro mediante Redsys/Sabadell</p>
          <p>Al continuar serás redirigido al TPV Virtual del Banco Sabadell para realizar el pago de <strong>{amount}€</strong> de forma segura con 3D Secure. Una vez confirmado el pago, el bono se enviará automáticamente al destinatario con el PDF adjunto.</p>
        </div>

        {/* Legal — exigido por TPV Sabadell */}
        <div className="text-xs text-gray-500 mb-6 leading-relaxed">
          Al realizar el pago aceptas nuestra{" "}
          <a href="/politica-devolucion" target="_blank" className="text-primary underline">política de devolución</a>,
          los{" "}
          <a href="/terminos" target="_blank" className="text-primary underline">términos y condiciones</a>{" "}
          y has consultado los{" "}
          <a href="/datos-fiscales" target="_blank" className="text-primary underline">datos fiscales del comercio</a>{" "}
          (LA FAMILIA GASTRO, S.L. · NIF B-70596397).
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mb-6">{error}</div>
        )}

        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-secondary flex-1" disabled={isProcessing}>
            Atrás
          </button>
          <button type="submit" disabled={isProcessing} className="btn-primary flex-1 disabled:opacity-50">
            {isProcessing ? "Redirigiendo al banco..." : `Pagar ${amount}€ y enviar bono`}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Pago procesado de forma segura por Redsys · Banco Sabadell
        </p>
      </form>
    </>
  );
}
