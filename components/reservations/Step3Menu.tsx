"use client";

import { useState } from "react";
import { MENU_LIST, type MenuConfig } from "@/lib/menus";

interface Step3MenuProps {
  onComplete: (menu: MenuConfig) => void;
  onBack: () => void;
}

export default function Step3Menu({ onComplete, onBack }: Step3MenuProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuConfig | null>(null);

  const handleContinue = () => {
    if (!selectedMenu) return;
    onComplete(selectedMenu);
  };

  return (
    <div>
      <h2 className="text-3xl font-serif font-light mb-2">Seleccione un menú</h2>
      <p className="text-gray-600 mb-8">
        Elija la experiencia gastronómica. En el siguiente paso indicará comensales y armonía por persona.
      </p>

      <div className="space-y-4 mb-8">
        {MENU_LIST.map((menu) => {
          const isSelected = selectedMenu?.id === menu.id;

          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => setSelectedMenu(menu)}
              className={`w-full text-left p-6 border-2 transition-all duration-300 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : "border-gray-200 hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-grow">
                  <h3 className="text-2xl font-serif font-light mb-2 flex items-center gap-3">
                    {menu.name}
                    {isSelected && (
                      <span className="text-primary">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">{menu.description}</p>
                </div>
                <div className="text-right ml-6 flex-shrink-0">
                  <div className="text-3xl font-serif font-light text-accent">{menu.basePrice}€</div>
                  <div className="text-xs text-gray-500 mt-1">por persona</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-accent rounded-full" />
                  <span>{menu.courses}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-accent rounded-full" />
                  <span>{menu.duration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {menu.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className={`text-xs px-3 py-1 rounded-full ${
                      isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedMenu && (
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 mb-8 border-l-4 border-accent">
          <p className="text-sm tracking-wider uppercase text-gray-600 mb-2">Menú seleccionado</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-serif font-light mb-1">{selectedMenu.displayName}</p>
              <p className="text-sm text-gray-600">{selectedMenu.courses}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-serif font-light text-accent">{selectedMenu.basePrice}€</div>
              <div className="text-xs text-gray-500">base por persona</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          Atrás
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedMenu}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
