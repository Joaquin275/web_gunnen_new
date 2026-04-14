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

        <p className="text-sm text-gray-500 mb-12">
          Mínimo {minPeople} — Máximo {maxPeople} personas
        </p>
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
