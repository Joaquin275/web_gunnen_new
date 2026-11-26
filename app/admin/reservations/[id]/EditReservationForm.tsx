"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MENU_LIST, calcOrderTotal, isHarmonyValid } from "@/lib/menus";

const ALLERGENS = [
  "Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja",
  "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Sulfitos",
  "Altramuces", "Moluscos",
];

interface GiftCardInfo {
  amount: number;
  numberOfPeople: number;
  menuId: string | null;
  menuName: string | null;
}

interface Props {
  id: string;
  initial: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    reservationDate: string;
    reservationTime: string;
    numberOfPeople: number;
    menuId: string;
    harmonyNone: number;
    harmonyVino: number;
    harmonyNolo: number;
    allergens: string[];
    allergenNotes: string;
    observations: string;
    depositAmount: number;
  };
  giftCard: GiftCardInfo | null;
}

export default function EditReservationForm({ id, initial, giftCard }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initial);
  const [slots, setSlots] = useState<{ time: string; label: string; available: number }[]>([]);
  const [slotError, setSlotError] = useState("");

  const people = Number(form.numberOfPeople) || 1;
  const harmony = {
    none: Number(form.harmonyNone) || 0,
    vino: Number(form.harmonyVino) || 0,
    nolo: Number(form.harmonyNolo) || 0,
  };
  const total = form.menuId ? calcOrderTotal(form.menuId, people, harmony) : 0;
  const giftCover = giftCard ? Number(giftCard.amount) : 0;
  const remaining = Math.max(0, total - giftCover);
  const theoreticalDeposit = Math.round(remaining * 0.3 * 100) / 100;
  const depositDiff = Math.round((theoreticalDeposit - form.depositAmount) * 100) / 100;
  const harmonyOk = isHarmonyValid(people, harmony);

  useEffect(() => {
    if (!form.reservationDate) return;
    const load = async () => {
      setSlotError("");
      const res = await fetch(
        `/api/availability/timeslots?date=${form.reservationDate}&excludeId=${id}`
      );
      if (!res.ok) {
        setSlots([]);
        return;
      }
      const data = await res.json();
      const list = data.timeSlots || [];
      setSlots(list);
      if (list.length === 0) setSlotError("Ese día no hay franjas abiertas.");
    };
    load();
  }, [form.reservationDate, id]);

  const setPeople = (n: number) => {
    const next = Math.max(1, Math.min(4, n));
    const sum = harmony.none + harmony.vino + harmony.nolo;
    let none = harmony.none;
    let vino = harmony.vino;
    let nolo = harmony.nolo;
    if (sum < next) none += next - sum;
    if (sum > next) {
      let excess = sum - next;
      const order = ["none", "nolo", "vino"] as const;
      const vals = { none, vino, nolo };
      for (const k of order) {
        if (excess <= 0) break;
        const reduce = Math.min(vals[k], excess);
        vals[k] -= reduce;
        excess -= reduce;
      }
      none = vals.none;
      vino = vals.vino;
      nolo = vals.nolo;
    }
    setForm((f) => ({ ...f, numberOfPeople: next, harmonyNone: none, harmonyVino: vino, harmonyNolo: nolo }));
  };

  const toggleAllergen = (name: string) => {
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(name)
        ? f.allergens.filter((a) => a !== name)
        : [...f.allergens, name],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harmonyOk) return alert("La armonía debe sumar el número de comensales.");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "No se pudo guardar");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const preview = useMemo(() => ({ total, remaining, theoreticalDeposit, depositDiff }), [
    total, remaining, theoreticalDeposit, depositDiff,
  ]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm"
      >
        Editar reserva
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-white border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs tracking-wider uppercase text-gray-500">Editar reserva</h2>
        <button type="button" onClick={() => { setForm(initial); setOpen(false); }} className="text-xs text-gray-400 hover:text-primary">
          Cerrar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nombre</label>
          <input required className="w-full border border-gray-200 px-3 py-2 text-sm" value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Apellidos</label>
          <input required className="w-full border border-gray-200 px-3 py-2 text-sm" value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input required type="email" className="w-full border border-gray-200 px-3 py-2 text-sm" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
          <input className="w-full border border-gray-200 px-3 py-2 text-sm" value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha</label>
          <input required type="date" className="w-full border border-gray-200 px-3 py-2 text-sm" value={form.reservationDate}
            onChange={(e) => setForm((f) => ({ ...f, reservationDate: e.target.value, reservationTime: "" }))} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hora</label>
          <select required className="w-full border border-gray-200 px-3 py-2 text-sm" value={form.reservationTime}
            onChange={(e) => setForm((f) => ({ ...f, reservationTime: e.target.value }))}>
            <option value="">Selecciona hora</option>
            {slots.map((s) => (
              <option key={s.time} value={s.time} disabled={s.available === 0 && s.time !== initial.reservationTime}>
                {s.time} · {s.label}{s.available === 0 ? " (ocupada)" : ""}
              </option>
            ))}
          </select>
          {slotError && <p className="text-xs text-red-600 mt-1">{slotError}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Comensales</label>
        <div className="flex items-center gap-3">
          <button type="button" className="w-8 h-8 border border-gray-200" onClick={() => setPeople(people - 1)}>–</button>
          <span className="w-8 text-center">{people}</span>
          <button type="button" className="w-8 h-8 border border-gray-200" onClick={() => setPeople(people + 1)}>+</button>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Menú</label>
        <div className="flex flex-wrap gap-2">
          {MENU_LIST.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => setForm((f) => ({ ...f, menuId: m.id }))}
              className={`px-4 py-2 text-sm border ${form.menuId === m.id ? "border-primary bg-primary text-white" : "border-gray-200"}`}
            >
              {m.displayName} ({m.basePrice}€)
            </button>
          ))}
        </div>
        {giftCard?.menuName && (
          <p className="text-xs text-gray-400 mt-2">Bono vinculado: {giftCard.menuName} · {giftCard.numberOfPeople} pers. · {giftCard.amount.toFixed(2)}€</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Armonía (debe sumar {people})</label>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {([
            ["harmonyNone", "Solo menú", harmony.none],
            ["harmonyVino", "Vino +45€", harmony.vino],
            ["harmonyNolo", "No/Low +30€", harmony.nolo],
          ] as const).map(([key, label, val]) => (
            <div key={key}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <input
                type="number"
                min={0}
                max={people}
                className="w-full border border-gray-200 px-2 py-1"
                value={val}
                onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) || 0 }))}
              />
            </div>
          ))}
        </div>
        {!harmonyOk && <p className="text-xs text-red-600 mt-1">La suma debe ser {people} (ahora {harmony.none + harmony.vino + harmony.nolo}).</p>}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2">Alérgenos</label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => toggleAllergen(a)}
              className={`px-2 py-1 text-xs border ${form.allergens.includes(a) ? "border-primary bg-primary/10" : "border-gray-200"}`}
            >
              {a}
            </button>
          ))}
        </div>
        <input
          className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm"
          placeholder="Notas de alérgenos"
          value={form.allergenNotes}
          onChange={(e) => setForm((f) => ({ ...f, allergenNotes: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Observaciones</label>
        <textarea
          rows={3}
          className="w-full border border-gray-200 px-3 py-2 text-sm resize-none"
          value={form.observations}
          onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 text-sm space-y-1">
        <p>Total estimado: <strong>{preview.total.toFixed(2)}€</strong></p>
        {giftCover > 0 && (
          <>
            <p>Bono aplicado: −{Math.min(giftCover, preview.total).toFixed(2)}€</p>
            <p>Resta: <strong>{preview.remaining.toFixed(2)}€</strong></p>
          </>
        )}
        <p>Retención teórica 30%: <strong>{preview.theoreticalDeposit.toFixed(2)}€</strong></p>
        <p>Retención real (Redsys, no se modifica): <strong className="text-blue-700">{form.depositAmount.toFixed(2)}€</strong></p>
        {preview.depositDiff > 0.05 && (
          <p className="text-amber-700 text-xs pt-1">
            La nueva selección dejaría {preview.depositDiff.toFixed(2)}€ de retención teórica por encima de lo ya retenido. El TPV no se toca; revisad si hay que gestionar el extra aparte.
          </p>
        )}
        {preview.depositDiff < -0.05 && (
          <p className="text-gray-500 text-xs pt-1">
            La retención real es mayor que la teórica actual. Se mantiene lo ya retenido.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || !harmonyOk} className="btn-primary disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" onClick={() => { setForm(initial); setOpen(false); }} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
