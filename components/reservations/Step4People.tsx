"use client";

import { useState } from "react";

interface Step4PeopleProps {
  minPeople: number;
  maxPeople: number;
  initialPeople: number;
  onComplete: (numberOfPeople: number) => void;
  onBack: () => void;
}

export default function Step4People({
  minPeople,
  maxPeople,
  initialPeople,
  onComplete,
  onBack,
}: Step4PeopleProps) {
  const [numberOfPeople, setNumberOfPeople] = useState(initialPeople);

  const handleDecrease = () => {
    if (numberOfPeople > minPeople) {
      setNumberOfPeople(numberOfPeople - 1);
    }
  };

  const handleIncrease = () => {
    if (numberOfPeople < maxPeople) {
      setNumberOfPeople(numberOfPeople + 1);
    }
  };

  const handleContinue = () => {
    onComplete(numberOfPeople);
  };

  return (
    <div>
      <h2 className="text-3xl font-serif font-light mb-2">
        ¿Cuántos comensales?
      </h2>
      <p className="text-gray-600 mb-8">
        Ajuste el número de personas para su reserva
      </p>

      <div className="flex flex-col items-center justify-center py-12">
        {/* Contador */}
        <div className="flex items-center gap-8 mb-8">
          <button
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
            onClick={handleIncrease}
            disabled={numberOfPeople >= maxPeople}
            className="w-12 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Mínimo {minPeople} — Máximo {maxPeople} personas
        </p>

        {/* Nota grupos +4 */}
        <a
          href="https://wa.me/34613739550?text=Hola%2C%20me%20gustar%C3%ADa%20reservar%20para%20m%C3%A1s%20de%204%20personas."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-800 hover:bg-green-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="#25D366" className="shrink-0">
            <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.85 1.93 6.94L2 30l7.3-1.91A13.94 13.94 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.6l-.42-.25-4.33 1.13 1.16-4.22-.27-.44A11.5 11.5 0 1 1 16 27.5zm6.29-8.62c-.34-.17-2.02-.99-2.33-1.1-.31-.11-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.54-.28-.67-.56-.58-.77-.59l-.65-.01c-.23 0-.6.09-.91.43-.31.34-1.19 1.16-1.19 2.83s1.22 3.28 1.39 3.51c.17.23 2.4 3.66 5.82 5.13.81.35 1.45.56 1.94.72.82.26 1.56.22 2.15.13.66-.1 2.02-.82 2.31-1.62.28-.79.28-1.47.2-1.62-.09-.14-.31-.23-.65-.4z" />
          </svg>
          <span>
            ¿Sois más de {maxPeople}? Contáctanos por WhatsApp para grupos grandes
          </span>
          <svg className="w-4 h-4 ml-auto shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary flex-1">
          Atrás
        </button>
        <button onClick={handleContinue} className="btn-primary flex-1">
          Continuar
        </button>
      </div>
    </div>
  );
}
