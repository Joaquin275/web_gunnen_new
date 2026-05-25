"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// ─── Colores por menú ─────────────────────────────────────────────────────────
const MENU_COLORS: Record<string, string> = {
  "IMPULSO":  "#8b7355",
  "TEMPO":    "#4a7c8e",
  "Sin menú": "#aaa",
};
function menuColor(name: string) {
  return MENU_COLORS[name] ?? "#c0a882";
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DayData {
  date: string;
  covers: number;
  reservations: number;
  menus: Record<string, number>;
  list: {
    id: string;
    reservationDate: string;
    reservationTime: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    numberOfPeople: number;
    menuName: string | null;
    depositAmount: number;
    status: string;
  }[];
}

interface AnalyticsData {
  month: string;
  totalCovers: number;
  totalReservations: number;
  depositTotal: number;
  menuTotals: Record<string, number>;
  days: Record<string, DayData>;
}

const MAX_COVERS_PER_DAY = 20; // para calcular % de ocupación

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function occupancyColor(covers: number) {
  const pct = Math.min(covers / MAX_COVERS_PER_DAY, 1);
  if (pct === 0) return "bg-white";
  if (pct < 0.3) return "bg-green-100";
  if (pct < 0.6) return "bg-amber-100";
  if (pct < 0.85) return "bg-orange-200";
  return "bg-red-200";
}
function occupancyBorder(covers: number) {
  const pct = Math.min(covers / MAX_COVERS_PER_DAY, 1);
  if (pct === 0) return "border-gray-100";
  if (pct < 0.3) return "border-green-300";
  if (pct < 0.6) return "border-amber-300";
  if (pct < 0.85) return "border-orange-400";
  return "border-red-500";
}

// ─── Exportar Excel ───────────────────────────────────────────────────────────
async function exportExcel(data: AnalyticsData, monthLabel: string) {
  const { utils, writeFile } = await import("xlsx");
  const rows: any[] = [];
  rows.push(["Fecha", "Hora", "Nombre", "Email", "Teléfono", "Personas", "Menú", "Retención (€)", "Estado"]);
  for (const day of Object.values(data.days).sort((a, b) => a.date.localeCompare(b.date))) {
    for (const r of day.list) {
      rows.push([
        fmtDate(day.date),
        r.reservationTime,
        `${r.firstName} ${r.lastName}`,
        r.email,
        r.phone,
        r.numberOfPeople,
        r.menuName || "—",
        Number(r.depositAmount).toFixed(2),
        r.status,
      ]);
    }
  }
  // Hoja de resumen
  const summary = [
    ["Mes", monthLabel],
    ["Total reservas", data.totalReservations],
    ["Total comensales", data.totalCovers],
    ["Total retenciones (€)", data.depositTotal.toFixed(2)],
    [],
    ["Menú", "Comensales"],
    ...Object.entries(data.menuTotals).map(([k, v]) => [k, v]),
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.aoa_to_sheet(rows), "Reservas");
  utils.book_append_sheet(wb, utils.aoa_to_sheet(summary), "Resumen");
  writeFile(wb, `gunnen-reservas-${data.month}.xlsx`);
}

// ─── Exportar PDF ─────────────────────────────────────────────────────────────
async function exportPDF(data: AnalyticsData, monthLabel: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });
  const accent = [139, 115, 85] as [number, number, number];

  // Cabecera
  doc.setFillColor(...accent);
  doc.rect(0, 0, 297, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("GUNNEN — Análisis de Reservas", 14, 12);
  doc.setFontSize(10);
  doc.text(monthLabel, 250, 12);

  // Resumen
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.text(`Reservas: ${data.totalReservations}   Comensales: ${data.totalCovers}   Retenciones: ${data.depositTotal.toFixed(2)}€`, 14, 28);

  // Tabla de reservas
  const rows: any[] = [];
  for (const day of Object.values(data.days).sort((a, b) => a.date.localeCompare(b.date))) {
    for (const r of day.list) {
      rows.push([
        fmtDate(day.date),
        r.reservationTime,
        `${r.firstName} ${r.lastName}`,
        r.email,
        r.numberOfPeople,
        r.menuName || "—",
        `${Number(r.depositAmount).toFixed(2)}€`,
        r.status === "CONFIRMED" ? "Confirmada" : r.status === "CANCELLED" ? "Cancelada" : "Pendiente",
      ]);
    }
  }

  autoTable(doc, {
    startY: 34,
    head: [["Fecha", "Hora", "Nombre", "Email", "Pers.", "Menú", "Retención", "Estado"]],
    body: rows,
    headStyles: { fillColor: accent, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 248, 244] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 16 },
      3: { cellWidth: 50 },
      6: { cellWidth: 22 },
      7: { cellWidth: 24 },
    },
  });

  // Resumen por menú
  const lastY = (doc as any).lastAutoTable?.finalY ?? 100;
  if (lastY + 40 < 190) {
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Distribución por menú:", 14, lastY + 10);
    let x = 14;
    for (const [menu, covers] of Object.entries(data.menuTotals)) {
      doc.text(`${menu}: ${covers} comensales`, x, lastY + 18);
      x += 70;
    }
  }

  doc.save(`gunnen-reservas-${data.month}.pdf`);
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AnalyticsClient() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const fetchData = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?month=${m}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(month); }, [month, fetchData]);

  // Navegación de mes
  function prevMonth() {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  function nextMonth() {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const [year, mo] = month.split("-").map(Number);
  const monthLabel = new Date(year, mo - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  // Construir grilla del calendario
  const firstDay = new Date(year, mo - 1, 1).getDay(); // 0=dom
  const daysInMonth = new Date(year, mo, 0).getDate();
  // Ajustar a lunes=0
  const startOffset = (firstDay + 6) % 7;

  // Datos para el gráfico de barras (cobertura por día del mes)
  const barData = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${month}-${String(i + 1).padStart(2, "0")}`;
    const d = data?.days[key];
    return { day: i + 1, covers: d?.covers ?? 0, reservas: d?.reservations ?? 0 };
  });

  // Datos para el pie de menús
  const pieData = data
    ? Object.entries(data.menuTotals).map(([name, value]) => ({ name, value }))
    : [];

  const selectedDayData = selectedDay ? data?.days[selectedDay] : null;

  return (
    <div className="space-y-6">

      {/* ── CABECERA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light">Analytics de Reservas</h1>
          <p className="text-gray-500 mt-1 text-sm">Seguimiento visual por día, menú y ocupación</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => data && exportExcel(data, monthLabelCap)}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Excel
          </button>
          <button
            onClick={() => data && exportPDF(data, monthLabelCap)}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase border border-red-600 text-red-700 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            PDF
          </button>
        </div>
      </div>

      {/* ── NAVEGACIÓN DE MES ── */}
      <div className="flex items-center justify-between bg-white border border-gray-200 px-5 py-3">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-serif font-light tracking-wide">{monthLabelCap}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* ── KPIs ── */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 p-5">
              <div className="text-3xl font-serif font-light">{data?.totalReservations ?? 0}</div>
              <div className="text-xs tracking-wider uppercase text-gray-500 mt-1">Reservas</div>
            </div>
            <div className="bg-white border border-gray-200 p-5">
              <div className="text-3xl font-serif font-light">{data?.totalCovers ?? 0}</div>
              <div className="text-xs tracking-wider uppercase text-gray-500 mt-1">Comensales</div>
            </div>
            <div className="bg-white border border-gray-200 p-5">
              <div className="text-3xl font-serif font-light text-accent">
                {data ? (data.totalCovers / Math.max(data.totalReservations, 1)).toFixed(1) : "—"}
              </div>
              <div className="text-xs tracking-wider uppercase text-gray-500 mt-1">Media / reserva</div>
            </div>
            <div className="bg-white border border-gray-200 p-5">
              <div className="text-3xl font-serif font-light text-green-700">
                {data ? `${data.depositTotal.toFixed(0)}€` : "—"}
              </div>
              <div className="text-xs tracking-wider uppercase text-gray-500 mt-1">Retenciones</div>
            </div>
          </div>

          {/* ── LEYENDA OCUPACIÓN ── */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-white border border-gray-200 inline-block" /> Sin reservas</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-green-100 border border-green-300 inline-block" /> Baja (&lt;30%)</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-amber-100 border border-amber-300 inline-block" /> Media (30–60%)</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-orange-200 border border-orange-400 inline-block" /> Alta (60–85%)</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-red-200 border border-red-500 inline-block" /> Lleno (&gt;85%)</span>
          </div>

          {/* ── CALENDARIO ── */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            {/* Cabeceras días */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div key={d} className="py-2 text-center text-xs tracking-wider uppercase text-gray-400 font-medium">
                  {d}
                </div>
              ))}
            </div>

            {/* Celdas */}
            <div className="grid grid-cols-7">
              {/* Celdas vacías iniciales */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] border-r border-b border-gray-100 bg-gray-50/50" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const key = `${month}-${String(dayNum).padStart(2, "0")}`;
                const d = data?.days[key];
                const isSelected = selectedDay === key;
                const isToday =
                  key === new Date().toISOString().split("T")[0];

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(isSelected ? null : key)}
                    className={`min-h-[80px] border-r border-b border-gray-100 p-2 text-left transition-all hover:ring-2 hover:ring-accent/40 focus:outline-none
                      ${d ? occupancyColor(d.covers) : "bg-white"}
                      ${d ? occupancyBorder(d.covers) : "border-gray-100"}
                      ${isSelected ? "ring-2 ring-accent" : ""}
                    `}
                  >
                    <span className={`text-xs font-medium ${isToday ? "bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center" : "text-gray-600"}`}>
                      {dayNum}
                    </span>
                    {d && (
                      <div className="mt-1 space-y-0.5">
                        <div className="text-[11px] font-semibold text-gray-800">
                          {d.covers} 🍽 · {d.reservations} res.
                        </div>
                        {Object.entries(d.menus).map(([menu, count]) => (
                          <div key={menu} className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: menuColor(menu) }}
                            />
                            <span className="text-[10px] text-gray-600 truncate">{menu}: {count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── PANEL DE DÍA SELECCIONADO ── */}
          {selectedDay && selectedDayData && (
            <div className="bg-white border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-serif font-light text-lg">
                  {fmtDate(selectedDay)} — {selectedDayData.covers} comensales · {selectedDayData.reservations} reservas
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-gray-500">Hora</th>
                      <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-gray-500">Menú</th>
                      <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Personas</th>
                      <th className="px-4 py-3 text-right text-xs tracking-wider uppercase text-gray-500">Retención</th>
                      <th className="px-4 py-3 text-center text-xs tracking-wider uppercase text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedDayData.list.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{r.reservationTime}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.firstName} {r.lastName}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: menuColor(r.menuName ?? "Sin menú") }} />
                            {r.menuName || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{r.numberOfPeople}</td>
                        <td className="px-4 py-3 text-right">{Number(r.depositAmount).toFixed(2)}€</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 tracking-wider uppercase ${
                            r.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                            r.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {r.status === "CONFIRMED" ? "Confirmada" : r.status === "CANCELLED" ? "Cancelada" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── GRÁFICO DE BARRAS ── */}
          <div className="bg-white border border-gray-200 p-5">
            <h3 className="text-xs tracking-wider uppercase text-gray-500 mb-5">Comensales por día</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v, name) => [v, name === "covers" ? "Comensales" : "Reservas"]}
                  labelFormatter={(l) => `Día ${l}`}
                />
                <Bar dataKey="covers" name="Comensales" radius={[2, 2, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.covers === 0 ? "#e5e7eb" : entry.covers >= MAX_COVERS_PER_DAY * 0.85 ? "#ef4444" : entry.covers >= MAX_COVERS_PER_DAY * 0.6 ? "#f97316" : entry.covers >= MAX_COVERS_PER_DAY * 0.3 ? "#f59e0b" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── PIE DE MENÚS ── */}
          {pieData.length > 0 && (
            <div className="bg-white border border-gray-200 p-5">
              <h3 className="text-xs tracking-wider uppercase text-gray-500 mb-5">Distribución por menú</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={menuColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} comensales`]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full sm:w-48 shrink-0 space-y-3">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: menuColor(entry.name) }} />
                        {entry.name}
                      </span>
                      <span className="font-medium">{entry.value} pers.</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{data?.totalCovers} pers.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
