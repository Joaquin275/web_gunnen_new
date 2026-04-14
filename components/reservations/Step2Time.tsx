"use client";

import { useState, useEffect } from "react";

interface TimeSlot {
  id: string;
  time: string;
  capacity: number;
  available: number;
  minPeople: number;
  maxPeople: number;
  depositPerPerson: number;
}

interface Step2TimeProps {
  date: string;
  onComplete: (timeSlotId: string, time: string, slotData: any) => void;
  onBack: () => void;
}

export default function Step2Time({ date, onComplete, onBack }: Step2TimeProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeSlots();
  }, [date]);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`/api/availability/timeslots?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data.timeSlots);
      }
    } catch (error) {
      console.error("Error cargando horarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      onComplete(selectedSlot.id, selectedSlot.time, {
        minPeople: selectedSlot.minPeople,
        maxPeople: selectedSlot.maxPeople,
        depositPerPerson: selectedSlot.depositPerPerson,
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Cargando horarios disponibles...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-serif font-light mb-4">Seleccione un horario</h2>
      <p className="text-gray-600 mb-8">
        {new Date(date + 'T00:00:00').toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {timeSlots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No hay horarios disponibles para esta fecha.</p>
          <button onClick={onBack} className="btn-secondary">
            Volver a seleccionar fecha
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isAvailable = slot.available > 0;

              return (
                <button
                  key={slot.id}
                  onClick={() => isAvailable && handleSlotSelect(slot)}
                  disabled={!isAvailable}
                  className={`p-3 sm:p-6 border transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : isAvailable
                      ? "border-gray-300 hover:border-primary hover:bg-gray-50"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <div className="text-lg sm:text-2xl font-serif mb-1 sm:mb-2">{slot.time}</div>
                  <div className="text-[10px] sm:text-xs tracking-wider uppercase">
                    {isAvailable ? "Disponible" : "Reservado"}
                  </div>
                  <div className={`mt-2 w-2 h-2 rounded-full mx-auto ${
                    isAvailable
                      ? isSelected ? "bg-white" : "bg-accent"
                      : "bg-gray-300"
                  }`} />
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 mb-8 border-l-4 border-accent">
              <p className="text-sm tracking-wider uppercase text-gray-600 mb-2">
                Horario seleccionado
              </p>
              <p className="text-2xl font-serif font-light">
                {new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
                  weekday: "long", day: "numeric", month: "long",
                })}
                {" — "}
                {selectedSlot.time}h
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Hasta {selectedSlot.maxPeople} comensales · La señal se calcula según el menú elegido
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={onBack} className="btn-secondary flex-1">
              Atrás
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedSlot}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
