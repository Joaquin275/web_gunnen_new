"use client";

import { useState } from "react";
import HarmonySelector from "@/components/shared/HarmonySelector";
import {
  adjustHarmonyForPeople,
  calcOrderTotal,
  defaultHarmony,
  formatHarmonySummary,
  harmonySum,
  isHarmonyValid,
  type HarmonyBreakdown,
} from "@/lib/menus";

interface Step4PeopleProps {
  minPeople: number;
  maxPeople: number;
  initialPeople: number;
  initialHarmony: HarmonyBreakdown;
  menuId: string;
  menuDisplayName: string;
  menuBasePrice: number;
  maridajePrice: number;
  noloPrice: number;
  onComplete: (numberOfPeople: number, harmony: HarmonyBreakdown) => void;
  onBack: () => void;
}

export default function Step4People({
  minPeople,
  maxPeople,
  initialPeople,
  initialHarmony,
  menuId,
  menuDisplayName,
  menuBasePrice,
  maridajePrice,
  noloPrice,
  onComplete,
  onBack,
}: Step4PeopleProps) {
  const [numberOfPeople, setNumberOfPeople] = useState(initialPeople);
  const [harmony, setHarmony] = useState<HarmonyBreakdown>(initialHarmony);
  const [error, setError] = useState<string | null>(null);

  const total = calcOrderTotal(menuId, numberOfPeople, harmony);

  const handleDecrease = () => {
    if (numberOfPeople <= minPeople) return;
    const nextPeople = numberOfPeople - 1;
    setNumberOfPeople(nextPeople);
    setHarmony((h) => adjustHarmonyForPeople(nextPeople, h));
    setError(null);
  };

  const handleIncrease = () => {
    if (numberOfPeople >= maxPeople) return;
    const nextPeople = numberOfPeople + 1;
    setNumberOfPeople(nextPeople);
    setHarmony((h) => adjustHarmonyForPeople(nextPeople, h));
    setError(null);
  };

  const handleContinue = () => {
    if (!isHarmonyValid(numberOfPeople, harmony)) {
      setError(`Asigne la armonía a los ${numberOfPeople} comensales (${harmonySum(harmony)} asignados).`);
      return;
    }
    onComplete(numberOfPeople, harmony);
  };

  return (
    <div>
      <h2 className="text-3xl font-serif font-light mb-2">Comensales y armonía</h2>
      <p className="text-gray-600 mb-2">
        {menuDisplayName} · {menuBasePrice}€ base por persona
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Indique cuántos comensales vienen y cuántos quieren cada tipo de armonía.
      </p>

      <div className="flex flex-col items-center justify-center py-8 mb-8 border border-gray-200 bg-gray-50">
        <div className="flex items-center gap-8 mb-4">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={numberOfPeople <= minPeople}
            className="w-12 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl"
          >
            −
          </button>

          <div className="text-center">
            <div className="text-6xl font-serif font-light">{numberOfPeople}</div>
            <div className="text-sm tracking-wider uppercase text-gray-600 mt-2">
              {numberOfPeople === 1 ? "Comensal" : "Comensales"}
            </div>
          </div>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={numberOfPeople >= maxPeople}
            className="w-12 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
        <p className="text-sm text-gray-500">Mínimo {minPeople} — Máximo {maxPeople} personas</p>
      </div>

      <div className="mb-8">
        <HarmonySelector
          numberOfPeople={numberOfPeople}
          maridajePrice={maridajePrice}
          noloPrice={noloPrice}
          value={harmony}
          onChange={(h) => { setHarmony(h); setError(null); }}
        />
      </div>

      <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 mb-8 border-l-4 border-accent">
        <p className="text-sm tracking-wider uppercase text-gray-600 mb-2">Resumen</p>
        <p className="text-sm text-gray-600 mb-1">{formatHarmonySummary(harmony)}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-700">Total estimado</span>
          <span className="text-3xl font-serif font-light text-accent">{total.toFixed(2)}€</span>
        </div>
      </div>

      <a
        href="https://wa.me/34613739550?text=Hola%2C%20me%20gustar%C3%ADa%20reservar%20para%20m%C3%A1s%20de%204%20personas."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-800 hover:bg-green-100 transition-colors mb-8"
      >
        <span>¿Sois más de {maxPeople}? Contáctanos por WhatsApp para grupos grandes</span>
      </a>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          Atrás
        </button>
        <button type="button" onClick={handleContinue} className="btn-primary flex-1">
          Continuar
        </button>
      </div>
    </div>
  );
}
