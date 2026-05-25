"use client";

import { useState, useEffect } from "react";
import { DAY_NAMES, type DaySchedule, type ScheduleSlot } from "@/lib/schedule-types";

function newSlot(): ScheduleSlot {
  return {
    id: `slot-${Date.now()}`,
    time: "13:00",
    label: "Comida",
    isActive: true,
    maxPeople: 5,
  };
}

export default function AvailabilityClient() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/availability")
      .then((r) => r.json())
      .then((d) => { setSchedule(d.schedule); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateDay = (dayOfWeek: number, patch: Partial<DaySchedule>) => {
    setSchedule((s) =>
      s.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d))
    );
  };

  const updateSlot = (dayOfWeek: number, slotId: string, patch: Partial<ScheduleSlot>) => {
    setSchedule((s) =>
      s.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, slots: d.slots.map((sl) => (sl.id === slotId ? { ...sl, ...patch } : sl)) }
          : d
      )
    );
  };

  const addSlot = (dayOfWeek: number) => {
    setSchedule((s) =>
      s.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, slots: [...d.slots, newSlot()] } : d
      )
    );
  };

  const removeSlot = (dayOfWeek: number, slotId: string) => {
    setSchedule((s) =>
      s.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, slots: d.slots.filter((sl) => sl.id !== slotId) }
          : d
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule }),
    });

    const data = await res.json();
    if (res.ok) {
      setSchedule(data.schedule);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(data.error || "Error al guardar");
    }
    setSaving(false);
  };

  const openDays = schedule.filter((d) => d.isOpen).length;
  const totalSlots = schedule.reduce(
    (n, d) => n + d.slots.filter((s) => s.isActive).length,
    0
  );

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-light">Disponibilidad</h1>
          <p className="text-gray-500 mt-1">
            {openDays} días abiertos · {totalSlots} franjas activas
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar horario"}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ✓ Horario guardado correctamente. Los cambios se aplican de inmediato en las reservas.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        {schedule.map((day) => (
          <div key={day.dayOfWeek} className="bg-white border border-gray-200 p-5">
            {/* Cabecera del día */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-serif font-light w-28">{DAY_NAMES[day.dayOfWeek]}</h2>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) => updateDay(day.dayOfWeek, { isOpen: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  {day.isOpen ? (
                    <span className="text-green-700">Abierto</span>
                  ) : (
                    <span className="text-gray-400">Cerrado</span>
                  )}
                </label>
              </div>
              {day.isOpen && (
                <button
                  type="button"
                  onClick={() => addSlot(day.dayOfWeek)}
                  className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary transition-colors"
                >
                  + Añadir franja
                </button>
              )}
            </div>

            {/* Franjas horarias */}
            {!day.isOpen ? (
              <p className="text-sm text-gray-400 italic">Sin reservas este día</p>
            ) : day.slots.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No hay franjas configuradas.{" "}
                <button
                  type="button"
                  onClick={() => addSlot(day.dayOfWeek)}
                  className="text-primary underline"
                >
                  Añadir la primera
                </button>
              </p>
            ) : (
              <div className="space-y-3">
                {day.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded ${
                      slot.isActive ? "bg-gray-50" : "bg-gray-50/50 opacity-60"
                    }`}
                  >
                    {/* Hora */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Hora</label>
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) =>
                          updateSlot(day.dayOfWeek, slot.id, { time: e.target.value })
                        }
                        className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Etiqueta */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Turno</label>
                      <select
                        value={slot.label}
                        onChange={(e) =>
                          updateSlot(day.dayOfWeek, slot.id, { label: e.target.value })
                        }
                        className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="Comida">Comida</option>
                        <option value="Cena">Cena</option>
                        <option value="">Otro</option>
                      </select>
                    </div>

                    {/* Máx. comensales */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Máx. personas</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={slot.maxPeople}
                        onChange={(e) =>
                          updateSlot(day.dayOfWeek, slot.id, {
                            maxPeople: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Activo */}
                    <div className="sm:col-span-3 flex items-end gap-2 pb-1.5">
                      <input
                        type="checkbox"
                        id={`active-${slot.id}`}
                        checked={slot.isActive}
                        onChange={(e) =>
                          updateSlot(day.dayOfWeek, slot.id, { isActive: e.target.checked })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <label htmlFor={`active-${slot.id}`} className="text-sm text-gray-600">
                        Activa
                      </label>
                    </div>

                    {/* Eliminar */}
                    <div className="sm:col-span-3 flex items-end justify-end pb-1.5">
                      <button
                        type="button"
                        onClick={() => removeSlot(day.dayOfWeek, slot.id)}
                        className="text-xs tracking-wider uppercase text-gray-400 hover:text-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-100 p-4 text-sm text-gray-500">
        Las franjas horarias definen qué horas puede elegir el cliente al reservar.
        Cada franja representa una mesa disponible — si ya hay una reserva confirmada
        para esa hora, aparecerá como ocupada.
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar horario"}
        </button>
        {saved && <p className="text-sm text-green-600">✓ Guardado</p>}
      </div>
    </div>
  );
}
