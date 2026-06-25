"use client";

import type { HarmonyBreakdown } from "@/lib/menus";
import { harmonySum } from "@/lib/menus";

interface HarmonySelectorProps {
  numberOfPeople: number;
  maridajePrice: number;
  noloPrice: number;
  value: HarmonyBreakdown;
  onChange: (value: HarmonyBreakdown) => void;
}

function CounterRow({
  label,
  description,
  price,
  count,
  priceColor,
  bgHover,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
}: {
  label: string;
  description?: string;
  price?: number;
  count: number;
  priceColor?: string;
  bgHover?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 px-3 rounded transition-colors ${bgHover || ""}`}>
      <div className="flex-1 min-w-0 pr-4">
        <span className="text-gray-800 font-medium block">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {price !== undefined && price > 0 && (
          <span className={`font-serif text-base ${priceColor || "text-gray-600"}`}>+{price}€</span>
        )}
        <button
          type="button"
          onClick={onDecrease}
          disabled={!canDecrease}
          className="w-8 h-8 border border-gray-300 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="w-6 text-center font-serif text-lg">{count}</span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={!canIncrease}
          className="w-8 h-8 border border-gray-300 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function HarmonySelector({
  numberOfPeople,
  maridajePrice,
  noloPrice,
  value,
  onChange,
}: HarmonySelectorProps) {
  const assigned = harmonySum(value);
  const remaining = numberOfPeople - assigned;

  const update = (key: keyof HarmonyBreakdown, delta: number) => {
    const next = { ...value, [key]: Math.max(0, value[key] + delta) };
    if (harmonySum(next) > numberOfPeople) return;
    onChange(next);
  };

  const canIncrease = remaining > 0;

  return (
    <div className="border-2 border-gray-200 p-6 space-y-1">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h4 className="text-lg font-serif font-light">
            Propuesta de Armonía <span className="text-sm font-sans text-gray-500">(por comensal)</span>
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Indique cuántas personas quieren cada opción. Deben sumar {numberOfPeople} comensales.
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 tracking-wider uppercase whitespace-nowrap ${
            remaining === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {remaining === 0 ? "Completo" : `Faltan ${remaining}`}
        </span>
      </div>

      <CounterRow
        label="Sin armonía · solo menú"
        count={value.none}
        onDecrease={() => update("none", -1)}
        onIncrease={() => update("none", 1)}
        canDecrease={value.none > 0}
        canIncrease={canIncrease}
      />

      <CounterRow
        label="Armonía con vino"
        description="Selección de vinos maridados con cada plato"
        price={maridajePrice}
        priceColor="text-amber-700"
        bgHover="hover:bg-amber-50"
        count={value.vino}
        onDecrease={() => update("vino", -1)}
        onIncrease={() => update("vino", 1)}
        canDecrease={value.vino > 0}
        canIncrease={canIncrease}
      />

      <CounterRow
        label="Armonía No/Low elaboración propia"
        description="Bebidas sin o bajo contenido alcohólico de temporada"
        price={noloPrice}
        priceColor="text-green-700"
        bgHover="hover:bg-green-50"
        count={value.nolo}
        onDecrease={() => update("nolo", -1)}
        onIncrease={() => update("nolo", 1)}
        canDecrease={value.nolo > 0}
        canIncrease={canIncrease}
      />
    </div>
  );
}
