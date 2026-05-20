"use client";

import { useState } from "react";
import GiftCardForm from "@/components/giftcards/GiftCardForm";

interface MenuOption {
  id: string;
  name: string;
  description: string;
  price: number;
  courses: string;
  tag?: string;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: "tempo",
    name: "Menú TEMPO",
    description: "2 Snacks · 8 platos · 2 postres · Pan · Petit fours",
    price: 100,
    courses: "12 momentos gastronómicos",
  },
  {
    id: "tempo-maridaje",
    name: "Menú TEMPO con Maridaje",
    description: "2 Snacks · 8 platos · 2 postres · Pan · Petit fours + Maridaje de vinos",
    price: 156,
    courses: "12 momentos + maridaje",
    tag: "Recomendado",
  },
  {
    id: "impulso",
    name: "Menú IMPULSO",
    description: "2 Snacks · 6 platos · 1 postre · Pan · Petit fours",
    price: 80,
    courses: "9 momentos gastronómicos",
  },
  {
    id: "impulso-maridaje",
    name: "Menú IMPULSO con Maridaje",
    description: "2 Snacks · 6 platos · 1 postre · Pan · Petit fours + Maridaje de vinos",
    price: 128,
    courses: "9 momentos + maridaje",
  },
];

export default function RegalaPage() {
  const [selectedMenu, setSelectedMenu] = useState<MenuOption | null>(null);
  const [step, setStep] = useState<"select" | "form">("select");

  const handleContinue = () => {
    if (!selectedMenu) return;
    setStep("form");
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">Bono Regalo</p>
            <h1 className="text-display font-serif font-light mb-6">Regala una experiencia</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Elige el menú que quieres regalar. El destinatario recibirá su bono por email con el código y todos los detalles.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12">

            {step === "select" && (
              <div>
                <h2 className="text-2xl font-serif font-light mb-2">Selecciona el menú a regalar</h2>
                <p className="text-sm text-gray-500 mb-8">Precio por persona · Válido 6 meses desde la emisión</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                  {MENU_OPTIONS.map((menu) => (
                    <button
                      key={menu.id}
                      onClick={() => setSelectedMenu(menu)}
                      className={`relative text-left p-7 border-2 transition-all duration-200 ${
                        selectedMenu?.id === menu.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {menu.tag && (
                        <span className="absolute top-4 right-4 text-xs tracking-widest uppercase bg-primary text-white px-3 py-1">
                          {menu.tag}
                        </span>
                      )}

                      {/* Selector visual */}
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 mb-4 transition-colors ${
                          selectedMenu?.id === menu.id
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedMenu?.id === menu.id && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>

                      <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">{menu.courses}</p>
                      <h3 className="text-xl font-serif font-light mb-2">{menu.name}</h3>
                      <p className="text-sm text-gray-500 mb-5 leading-relaxed">{menu.description}</p>
                      <p className="text-3xl font-serif font-light text-primary">{menu.price}€</p>
                      <p className="text-xs text-gray-400 mt-1">por persona</p>
                    </button>
                  ))}
                </div>

                {/* Info */}
                <div className="bg-gray-50 p-6 mb-8">
                  <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">El bono regalo incluye</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {[
                      "Código único personalizado enviado por email",
                      "Documento de bono regalo en PDF",
                      "Válido durante 6 meses desde su emisión",
                      "Canjeable al realizar la reserva online",
                      "Opción de programar el envío en una fecha futura",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedMenu}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  {selectedMenu
                    ? `Continuar con ${selectedMenu.name} — ${selectedMenu.price}€/persona`
                    : "Selecciona un menú para continuar"}
                </button>
              </div>
            )}

            {step === "form" && selectedMenu && (
              <GiftCardForm
                amount={selectedMenu.price}
                menuName={selectedMenu.name}
                onBack={() => setStep("select")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
