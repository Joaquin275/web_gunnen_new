"use client";

import { useState, useEffect } from "react";

interface Step1DateProps {
  onComplete: (date: string) => void;
}

// Días de cierre: 0 = Domingo, 1 = Lunes
const CLOSED_DAYS = [0, 1];

const availableMenus = [
  { name: "Tempo", color: "bg-accent/10 text-accent" },
  { name: "Impulso", color: "bg-amber-50 text-amber-700" },
];

export default function Step1Date({ onComplete }: Step1DateProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAvailableDates(); }, []);

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch("/api/availability/dates");
      if (response.ok) {
        const data = await response.json();
        setAvailableDates(data.dates);
      }
    } catch (error) {
      console.error("Error cargando fechas:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    if (newMonth >= new Date(new Date().setDate(1))) setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    return days;
  };

  const days = getMonthDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthName = currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Cargando disponibilidad...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-serif font-light mb-2">Seleccione una fecha</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">Abrimos de martes a sábado</p>

      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base sm:text-xl font-serif font-light capitalize">{monthName}</h3>
        <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Cabecera días — letra única en móvil, abreviatura en desktop */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {[
          { short: "D", long: "DOM" },
          { short: "L", long: "LUN" },
          { short: "M", long: "MAR" },
          { short: "X", long: "MIÉ" },
          { short: "J", long: "JUE" },
          { short: "V", long: "VIE" },
          { short: "S", long: "SÁB" },
        ].map((day) => (
          <div key={day.long} className="text-center text-[10px] sm:text-xs tracking-wider uppercase text-gray-400 font-semibold py-1">
            <span className="sm:hidden">{day.short}</span>
            <span className="hidden sm:inline">{day.long}</span>
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const isClosed = CLOSED_DAYS.includes(date.getDay());
          const isAvailable = !isClosed && (availableDates.length === 0 || availableDates.includes(dateStr));
          const isSelected = selectedDate === dateStr;
          const isPast = date < today;
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && !isPast && setSelectedDate(dateStr)}
              disabled={!isAvailable || isPast}
              title={isClosed ? "Cerrado Dom–Lun" : undefined}
              className={`aspect-square border transition-all relative ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-md"
                  : isClosed || isPast
                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                  : isAvailable
                  ? "border-gray-200 hover:border-primary hover:bg-gray-50"
                  : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
              } ${isToday && !isSelected ? "ring-1 ring-accent ring-offset-1" : ""}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className={`text-xs sm:text-base font-serif leading-none ${
                  isToday && !isSelected ? "text-accent font-semibold" : ""
                }`}>
                  {date.getDate()}
                </span>
                {/* Punto disponibilidad — solo en días disponibles y no móvil muy pequeño */}
                {isAvailable && !isPast && (
                  <span className={`mt-0.5 w-1 h-1 rounded-full block ${isSelected ? "bg-white" : "bg-accent"}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Fecha seleccionada */}
      {selectedDate && (
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 sm:p-6 mb-6 border-l-4 border-accent">
          <p className="text-xs tracking-wider uppercase text-gray-600 mb-1">Fecha seleccionada</p>
          <p className="text-lg sm:text-2xl font-serif font-light">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableMenus.map((menu) => (
              <span key={menu.name} className={`px-2 py-0.5 text-xs ${menu.color}`}>{menu.name}</span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => selectedDate && onComplete(selectedDate)}
        disabled={!selectedDate}
        className="btn-primary w-full disabled:opacity-50"
      >
        Continuar →
      </button>

      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>• Dom–Lun cerrado</p>
        <p>• El punto indica disponibilidad</p>
      </div>
    </div>
  );
}
