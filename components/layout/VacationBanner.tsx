"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const VACATION_START = "2026-08-25";
const VACATION_END   = "2026-09-08";
const STORAGE_KEY    = "gunnen_vacation_banner_dismissed";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function VacationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const today = todayStr();
    if (today < VACATION_START || today > VACATION_END) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,8,0.72)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden shadow-2xl"
        style={{ borderRadius: 0 }}
      >
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/experience/interior-gunnen.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            filter: "brightness(0.38)",
          }}
        />

        {/* Capa decorativa superior */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #c9a87c 50%, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #c9a87c 50%, transparent)" }}
        />

        {/* Botón cerrar */}
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center
                     text-white/60 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido */}
        <div className="relative z-10 px-8 py-10 text-center">
          {/* Etiqueta */}
          <p className="text-[10px] tracking-[0.35em] uppercase mb-5" style={{ color: "#c9a87c" }}>
            Aviso importante
          </p>

          {/* Título */}
          <h2
            className="text-white font-light mb-4 leading-tight"
            style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", letterSpacing: "0.04em" }}
          >
            Cerramos por vacaciones
          </h2>

          {/* Fechas */}
          <div
            className="inline-flex items-center gap-3 px-5 py-2 mb-6 text-sm tracking-widest uppercase"
            style={{
              border: "1px solid rgba(201,168,124,0.45)",
              color: "#c9a87c",
              letterSpacing: "0.15em",
            }}
          >
            <span>25 Ago</span>
            <span style={{ color: "rgba(201,168,124,0.5)" }}>—</span>
            <span>8 Sep 2026</span>
          </div>

          {/* Descripción */}
          <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            El restaurante permanecerá cerrado durante este período.
            Sin embargo, nuestro portal sigue activo — puedes hacer tu reserva
            o adquirir un bono regalo con total normalidad.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/reservas"
              onClick={dismiss}
              className="w-full sm:w-auto px-6 py-3 text-xs tracking-widest uppercase font-medium
                         transition-all duration-200 hover:opacity-90"
              style={{ background: "#c9a87c", color: "#0a0a08" }}
            >
              Reservar mesa
            </Link>
            <Link
              href="/regala"
              onClick={dismiss}
              className="w-full sm:w-auto px-6 py-3 text-xs tracking-widest uppercase font-medium
                         text-white/80 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Bono regalo
            </Link>
          </div>

          {/* Pie */}
          <button
            onClick={dismiss}
            className="mt-6 text-xs text-white/35 hover:text-white/60 transition-colors tracking-wider uppercase"
          >
            Continuar navegando
          </button>
        </div>
      </div>
    </div>
  );
}
