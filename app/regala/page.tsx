"use client";

import { useState } from "react";
import Image from "next/image";
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
    description: "14 bocados · 11 del mundo salado + 3 del mundo dulce · Pan · Petit fours",
    price: 100,
    courses: "14 bocados",
  },
  {
    id: "tempo-vino",
    name: "Menú TEMPO + Armonía con vino",
    description: "14 bocados · Pan · Petit fours + Propuesta de Armonía con vino",
    price: 145,
    courses: "14 bocados + armonía",
    tag: "Recomendado",
  },
  {
    id: "tempo-nolo",
    name: "Menú TEMPO + Armonía No/Low",
    description: "14 bocados · Pan · Petit fours + Armonía No/Low elaboración propia",
    price: 130,
    courses: "14 bocados + No/Low",
  },
  {
    id: "impulso",
    name: "Menú IMPULSO",
    description: "11 bocados · 9 del mundo salado + 2 del mundo dulce · Pan · Petit fours",
    price: 80,
    courses: "11 bocados",
  },
  {
    id: "impulso-vino",
    name: "Menú IMPULSO + Armonía con vino",
    description: "11 bocados · Pan · Petit fours + Propuesta de Armonía con vino",
    price: 125,
    courses: "11 bocados + armonía",
  },
  {
    id: "impulso-nolo",
    name: "Menú IMPULSO + Armonía No/Low",
    description: "11 bocados · Pan · Petit fours + Armonía No/Low elaboración propia",
    price: 110,
    courses: "11 bocados + No/Low",
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero con imagen */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/gallery/1.Postre-de-caqui-jengibre-y-miel-Gunnen-1-1.jpeg"
          alt="Bono regalo Gunnen"
          fill
          className="object-cover"
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
          <p className="text-white/75 mt-3 text-base font-light">
            Una experiencia gastronómica única
          </p>
        </div>
      </section>
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

                {/* Grupo TEMPO */}
                <div className="mb-8">
                  <p className="text-xs tracking-widest uppercase text-gray-400 mb-3 border-b border-gray-200 pb-2">
                    Menú TEMPO · 14 bocados
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MENU_OPTIONS.filter((m) => m.id.startsWith("tempo")).map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => setSelectedMenu(menu)}
                        className={`relative text-left p-5 border-2 transition-all duration-200 ${
                          selectedMenu?.id === menu.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {menu.tag && (
                          <span className="absolute top-3 right-3 text-xs tracking-widest uppercase bg-primary text-white px-2 py-0.5">
                            {menu.tag}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 mr-2 mb-3 transition-colors ${
                            selectedMenu?.id === menu.id ? "border-primary bg-primary" : "border-gray-300"
                          }`}
                        >
                          {selectedMenu?.id === menu.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">{menu.courses}</p>
                        <h3 className="text-base font-serif font-light mb-2 leading-snug">{menu.name}</h3>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{menu.description}</p>
                        <p className="text-2xl font-serif font-light text-primary">{menu.price}€</p>
                        <p className="text-xs text-gray-400">por persona</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grupo IMPULSO */}
                <div className="mb-10">
                  <p className="text-xs tracking-widest uppercase text-gray-400 mb-3 border-b border-gray-200 pb-2">
                    Menú IMPULSO · 11 bocados
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MENU_OPTIONS.filter((m) => m.id.startsWith("impulso")).map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => setSelectedMenu(menu)}
                        className={`relative text-left p-5 border-2 transition-all duration-200 ${
                          selectedMenu?.id === menu.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {menu.tag && (
                          <span className="absolute top-3 right-3 text-xs tracking-widest uppercase bg-primary text-white px-2 py-0.5">
                            {menu.tag}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 mr-2 mb-3 transition-colors ${
                            selectedMenu?.id === menu.id ? "border-primary bg-primary" : "border-gray-300"
                          }`}
                        >
                          {selectedMenu?.id === menu.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">{menu.courses}</p>
                        <h3 className="text-base font-serif font-light mb-2 leading-snug">{menu.name}</h3>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{menu.description}</p>
                        <p className="text-2xl font-serif font-light text-primary">{menu.price}€</p>
                        <p className="text-xs text-gray-400">por persona</p>
                      </button>
                    ))}
                  </div>
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
