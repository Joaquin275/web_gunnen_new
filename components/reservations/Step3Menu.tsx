"use client";

import { useState } from "react";

interface MenuOption {
  id: string;
  name: string;
  description: string;
  price: number;
  courses: string;
  duration: string;
  highlights: string[];
  maridajePrice?: number;
}

const menus: MenuOption[] = [
  {
    id: "tempo",
    name: "Tempo",
    description: "Nuestra invitación a entrar hasta la cocina, a olvidarte del reloj y de las prisas. Un recorrido más extenso por nuestra forma de entender la materia prima y el entorno.",
    price: 100,
    courses: "2 Snacks + 8 platos + 2 postres",
    duration: "Experiencia completa",
    highlights: ["Bebida Natural + Snack (Bienvenida)", "12 momentos gastronómicos", "Pan + Petit fours incluido"],
    maridajePrice: 56,
  },
  {
    id: "impulso",
    name: "Impulso",
    description: "Nuestra versión más inmediata, una propuesta que puede funcionar como puerta de entrada o si no dispones de mucho tiempo. Cocina ágil, estacional y de producto.",
    price: 80,
    courses: "2 Snacks + 6 platos + 1 postre",
    duration: "Versión más ágil",
    highlights: ["Bebida Natural + Snack (Bienvenida)", "9 momentos gastronómicos", "Pan + Petit fours incluido"],
    maridajePrice: 48,
  },
];

interface Step3MenuProps {
  onComplete: (menuId: string, menuName: string, menuPrice: number) => void;
  onBack: () => void;
}

export default function Step3Menu({ onComplete, onBack }: Step3MenuProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuOption | null>(null);
  const [addMaridaje, setAddMaridaje] = useState(false);

  const handleMenuSelect = (menu: MenuOption) => {
    setSelectedMenu(menu);
    // Reset maridaje cuando cambia de menú
    setAddMaridaje(false);
  };

  const handleContinue = () => {
    if (!selectedMenu) return;

    let finalPrice = selectedMenu.price;
    let finalName = selectedMenu.name;

    // Si tiene maridaje agregado
    if (addMaridaje && selectedMenu.maridajePrice) {
      finalPrice += selectedMenu.maridajePrice;
      finalName += " + Maridaje";
    }

    onComplete(selectedMenu.id, finalName, finalPrice);
  };

  return (
    <div>
      <h2 className="text-3xl font-serif font-light mb-2">Seleccione un menú</h2>
      <p className="text-gray-600 mb-8">
        Elija la experiencia gastronómica que desea disfrutar
      </p>

      {/* Grid de menús */}
      <div className="space-y-4 mb-8">
        {menus.map((menu) => {
          const isSelected = selectedMenu?.id === menu.id;

          return (
            <button
              key={menu.id}
              onClick={() => handleMenuSelect(menu)}
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
                  <p className="text-gray-600 leading-relaxed mb-3">
                    {menu.description}
                  </p>
                </div>
                <div className="text-right ml-6 flex-shrink-0">
                  <div className="text-3xl font-serif font-light text-accent">
                    {menu.price}€
                  </div>
                  <div className="text-xs text-gray-500 mt-1">por persona</div>
                </div>
              </div>

              {/* Detalles */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-accent rounded-full"></span>
                  <span>{menu.courses}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-accent rounded-full"></span>
                  <span>{menu.duration}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {menu.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className={`text-xs px-3 py-1 rounded-full ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-600"
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

      {/* Opción de agregar maridaje */}
      {selectedMenu && selectedMenu.maridajePrice && (
        <div className="bg-amber-50 border-2 border-amber-200 p-6 mb-8">
          <label className="flex items-start gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={addMaridaje}
              onChange={(e) => setAddMaridaje(e.target.checked)}
              className="w-5 h-5 mt-1 accent-amber-600"
            />
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-serif font-light">
                  ¿Agregar Maridaje?
                </h4>
                <span className="text-xl font-serif text-amber-700">
                  +{selectedMenu.maridajePrice}€
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Complementa tu menú con una selección de vinos y destilados cuidadosamente elegidos para armonizar con cada plato
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">Bodega seleccionada</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">Producto local</span>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Resumen de selección */}
      {selectedMenu && (
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 mb-8 border-l-4 border-accent">
          <p className="text-sm tracking-wider uppercase text-gray-600 mb-2">
            Menú seleccionado
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-serif font-light mb-1">
                {selectedMenu.name}
                {addMaridaje && selectedMenu.maridajePrice && (
                  <span className="text-amber-700"> + Maridaje</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                {selectedMenu.courses} · {selectedMenu.duration}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-serif font-light text-accent">
                {selectedMenu.price + (addMaridaje && selectedMenu.maridajePrice ? selectedMenu.maridajePrice : 0)}€
              </div>
              <div className="text-xs text-gray-500">por persona</div>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary flex-1">
          Atrás
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedMenu}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          Continuar →
        </button>
      </div>

      {/* Nota */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>El precio por persona se aplicará al total de comensales en el siguiente paso</p>
      </div>
    </div>
  );
}
