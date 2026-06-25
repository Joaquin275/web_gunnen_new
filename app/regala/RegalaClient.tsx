"use client";

import { useState } from "react";
import Image from "next/image";
import GiftCardForm from "@/components/giftcards/GiftCardForm";
import HarmonySelector from "@/components/shared/HarmonySelector";
import {
  MENU_LIST,
  adjustHarmonyForPeople,
  calcOrderTotal,
  defaultHarmony,
  formatHarmonySummary,
  harmonySum,
  isHarmonyValid,
  type HarmonyBreakdown,
  type MenuConfig,
} from "@/lib/menus";

export default function RegalaPage() {
  const [selectedMenu, setSelectedMenu] = useState<MenuConfig | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [harmony, setHarmony] = useState<HarmonyBreakdown>(defaultHarmony(2));
  const [step, setStep] = useState<"select" | "form">("select");
  const [error, setError] = useState<string | null>(null);

  const totalAmount = selectedMenu ? calcOrderTotal(selectedMenu.id, numberOfPeople, harmony) : 0;

  const handlePeopleChange = (n: number) => {
    setNumberOfPeople(n);
    setHarmony((h) => adjustHarmonyForPeople(n, h));
    setError(null);
  };

  const handleContinue = () => {
    if (!selectedMenu) return;
    if (!isHarmonyValid(numberOfPeople, harmony)) {
      setError(`Asigne la armonía a los ${numberOfPeople} comensales (${harmonySum(harmony)} asignados).`);
      return;
    }
    setError(null);
    setStep("form");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[75vh] min-h-[520px] overflow-hidden">
        <Image
          src="/images/heroes/regala.jpg"
          alt="Bono regalo Gunnen"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">Bono regalo</p>
          <h1
            className="text-white uppercase tracking-[0.15em] font-light"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Regala
          </h1>
          <p className="text-white/75 mt-3 text-base font-light">Una experiencia gastronómica única</p>
        </div>
      </section>

      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">Bono Regalo</p>
            <h1 className="text-display font-serif font-light mb-6">Regala una experiencia</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Elige el menú, el número de personas y la armonía de cada comensal. El destinatario recibirá su bono por email.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12">
            {step === "select" && (
              <div>
                <h2 className="text-2xl font-serif font-light mb-2">Selecciona el menú a regalar</h2>
                <p className="text-sm text-gray-500 mb-8">Precio base por persona · Válido 6 meses desde la emisión</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {MENU_LIST.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => {
                        setSelectedMenu(menu);
                        setHarmony(defaultHarmony(numberOfPeople));
                      }}
                      className={`relative text-left p-6 border-2 transition-all duration-200 ${
                        selectedMenu?.id === menu.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">{menu.courses}</p>
                      <h3 className="text-xl font-serif font-light mb-2">{menu.displayName}</h3>
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{menu.description}</p>
                      <p className="text-2xl font-serif font-light text-primary">{menu.basePrice}€</p>
                      <p className="text-xs text-gray-400">base por persona</p>
                    </button>
                  ))}
                </div>

                <div className="mb-8 p-6 border border-gray-200">
                  <p className="text-sm tracking-wider uppercase text-gray-600 mb-4">
                    ¿Para cuántas personas es el bono? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handlePeopleChange(n)}
                        className={`w-14 h-14 text-lg font-serif font-light border-2 transition-all duration-200 ${
                          numberOfPeople === n
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 hover:border-gray-400 text-gray-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMenu && (
                  <div className="mb-8">
                    <HarmonySelector
                      numberOfPeople={numberOfPeople}
                      maridajePrice={selectedMenu.maridajePrice}
                      noloPrice={selectedMenu.noloPrice}
                      value={harmony}
                      onChange={(h) => { setHarmony(h); setError(null); }}
                    />
                  </div>
                )}

                {selectedMenu && (
                  <div className="bg-gray-50 p-6 mb-8">
                    <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Resumen del bono</p>
                    <p className="text-sm text-gray-600 mb-1">{selectedMenu.displayName}</p>
                    <p className="text-sm text-gray-500 mb-3">{formatHarmonySummary(harmony)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {numberOfPeople} {numberOfPeople === 1 ? "persona" : "personas"}
                      </span>
                      <span className="text-2xl font-serif font-light text-primary">Total: {totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">{error}</div>
                )}

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedMenu}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  {selectedMenu
                    ? `Continuar — Total ${totalAmount.toFixed(2)}€`
                    : "Selecciona un menú para continuar"}
                </button>
              </div>
            )}

            {step === "form" && selectedMenu && (
              <GiftCardForm
                menuId={selectedMenu.id}
                menuName={selectedMenu.displayName}
                menuBasePrice={selectedMenu.basePrice}
                numberOfPeople={numberOfPeople}
                harmony={harmony}
                totalAmount={totalAmount}
                onBack={() => setStep("select")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
