"use client";

import { useState, useRef } from "react";

interface GiftCard {
  id: string; code: string; amount: number; numberOfPeople?: number;
  buyerName: string; buyerEmail: string;
  recipientName: string; recipientEmail: string;
  message: string; status: string; menuName?: string; sendDate: string;
  redeemedAt: string | null; createdAt: string;
}

interface BulkRow {
  code: string; amount: number;
  buyerName: string; buyerEmail: string;
  recipientName: string; recipientEmail: string;
  message: string;
}

function statusLabel(status: string) {
  if (status === "AVAILABLE") return { label: "Disponible", cls: "bg-blue-100 text-blue-700" };
  if (status === "ACTIVE") return { label: "Activo", cls: "bg-green-100 text-green-700" };
  if (status === "PENDING_PAYMENT") return { label: "Pendiente pago", cls: "bg-yellow-100 text-yellow-700" };
  if (status === "REDEEMED") return { label: "Canjeado", cls: "bg-gray-100 text-gray-500" };
  if (status === "CANCELLED") return { label: "Cancelado", cls: "bg-red-100 text-red-600" };
  return { label: "Expirado", cls: "bg-red-100 text-red-700" };
}

const SUGGESTED_AMOUNTS = [50, 100, 150, 200];

// Parse CSV text → rows. Handles quoted fields.
function parseCsv(text: string): string[][] {
  return text.trim().split(/\r?\n/).map((line) => {
    const cols: string[] = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

export default function GiftCardsClient({ initialGiftCards }: { initialGiftCards: GiftCard[] }) {
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
  const [tab, setTab] = useState<"list" | "new" | "bulk">("list");
  const [saving, setSaving] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkError, setBulkError] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number } | null>(null);
  const [csvText, setCsvText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    amount: 100, customAmount: "", useCustom: false,
    customCode: "",
    buyerName: "", buyerEmail: "",
    recipientName: "", recipientEmail: "",
    message: "",
    sendDate: new Date().toISOString().split("T")[0],
  });

  const finalAmount = form.useCustom ? Number(form.customAmount) : form.amount;

  // ── Single creation ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 1) return alert("Importe mínimo: 1€");
    setSaving(true);
    const res = await fetch("/api/admin/giftcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customCode: form.customCode,
        amount: finalAmount,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        recipientName: form.recipientName || form.buyerName,
        recipientEmail: form.recipientEmail || form.buyerEmail,
        message: form.message,
        sendDate: form.sendDate,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const all = await fetch("/api/admin/giftcards").then((r) => r.json());
      setGiftCards(all);
      setTab("list");
      setForm({ amount: 100, customAmount: "", useCustom: false, customCode: "", buyerName: "", buyerEmail: "", recipientName: "", recipientEmail: "", message: "", sendDate: new Date().toISOString().split("T")[0] });
    } else {
      alert(data.error || "Error al crear el bono");
    }
    setSaving(false);
  };

  // ── Redeem ───────────────────────────────────────────────────────────────────
  const handleRedeem = async (id: string) => {
    if (!confirm("¿Marcar este bono como canjeado?")) return;
    const res = await fetch(`/api/admin/giftcards/${id}/redeem`, { method: "POST" });
    if (res.ok) setGiftCards((g) => g.map((x) => x.id === id ? { ...x, status: "REDEEMED", redeemedAt: new Date().toISOString() } : x));
  };

  // ── Bulk CSV parse ────────────────────────────────────────────────────────────
  const parseBulkCsv = (text: string) => {
    setBulkError("");
    setBulkResult(null);
    const rows = parseCsv(text);
    if (rows.length === 0) { setBulkRows([]); return; }

    // Detect if first row is header
    const first = rows[0][0]?.toLowerCase();
    const hasHeader = first === "codigo" || first === "código" || first === "code";
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const parsed: BulkRow[] = [];
    const errors: string[] = [];
    dataRows.forEach((cols, i) => {
      const [code, amtRaw, buyerName = "", buyerEmail = "", recipientName = "", recipientEmail = "", message = ""] = cols;
      if (!code) return;
      const amount = parseFloat(amtRaw);
      if (!code.trim()) return;
      if (isNaN(amount) || amount < 1) { errors.push(`Fila ${i + 1 + (hasHeader ? 1 : 0)}: importe inválido ("${amtRaw}")`); return; }
      parsed.push({ code: code.trim().toUpperCase(), amount, buyerName, buyerEmail, recipientName, recipientEmail, message });
    });

    if (errors.length) setBulkError(errors.join("\n"));
    setBulkRows(parsed);
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      parseBulkCsv(text);
    };
    reader.readAsText(file, "utf-8");
  };

  const handleBulkImport = async () => {
    if (!bulkRows.length) return;
    setBulkImporting(true);
    const res = await fetch("/api/admin/giftcards/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: bulkRows }),
    });
    const data = await res.json();
    if (res.ok) {
      setBulkResult(data);
      const all = await fetch("/api/admin/giftcards").then((r) => r.json());
      setGiftCards(all);
      setBulkRows([]);
      setCsvText("");
      if (fileRef.current) fileRef.current.value = "";
    } else {
      alert(data.error || "Error en importación");
    }
    setBulkImporting(false);
  };

  const available = giftCards.filter((g) => g.status === "AVAILABLE").length;
  const active = giftCards.filter((g) => g.status === "ACTIVE").length;
  const redeemed = giftCards.filter((g) => g.status === "REDEEMED").length;
  const totalValue = giftCards.filter((g) => g.status === "AVAILABLE" || g.status === "ACTIVE").reduce((s, g) => s + g.amount, 0);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-light">Bonos Regalo</h1>
          <p className="text-gray-500 mt-1">{available} en inventario · {active} activos · {redeemed} canjeados · {totalValue}€ en circulación</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab(tab === "new" ? "list" : "new")}
            className={`btn-primary text-sm ${tab === "new" ? "opacity-60" : ""}`}
          >
            + Añadir bono
          </button>
          <button
            onClick={() => setTab(tab === "bulk" ? "list" : "bulk")}
            className={`btn-secondary text-sm ${tab === "bulk" ? "opacity-60" : ""}`}
          >
            ↑ Carga masiva
          </button>
        </div>
      </div>

      {/* ── Formulario individual ─────────────────────────────────────────────── */}
      {tab === "new" && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-6">
          <h2 className="font-serif font-light text-xl border-b border-gray-100 pb-4">Añadir código al inventario</h2>
          <p className="text-sm text-gray-500">Introduce el código y el importe. Los datos del comprador son opcionales — si los dejas vacíos, el código queda disponible para asignarse automáticamente cuando alguien compre en la web.</p>

          {/* Importe */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-3">Importe *</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {SUGGESTED_AMOUNTS.map((a) => (
                <button type="button" key={a}
                  onClick={() => setForm((f) => ({ ...f, amount: a, useCustom: false }))}
                  className={`px-5 py-2 text-sm border transition-colors ${!form.useCustom && form.amount === a ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-primary"}`}
                >{a}€</button>
              ))}
              <button type="button"
                onClick={() => setForm((f) => ({ ...f, useCustom: true }))}
                className={`px-5 py-2 text-sm border transition-colors ${form.useCustom ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-primary"}`}
              >Otro importe</button>
            </div>
            {form.useCustom && (
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={form.customAmount}
                  onChange={(e) => setForm((f) => ({ ...f, customAmount: e.target.value }))}
                  placeholder="Ej: 75"
                  className="border border-gray-200 px-3 py-2 w-32 focus:outline-none focus:border-primary" />
                <span className="text-gray-500">€</span>
              </div>
            )}
          </div>

          {/* Código personalizado */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Código</label>
            <input type="text" value={form.customCode}
              onChange={(e) => setForm((f) => ({ ...f, customCode: e.target.value }))}
              placeholder="Ej: GUNNEN-ABCD-1234  (vacío = se genera automáticamente)"
              className="w-full md:w-96 border border-gray-200 px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary uppercase placeholder:normal-case placeholder:font-sans"
              style={{ textTransform: form.customCode ? "uppercase" : "none" }}
            />
            <p className="text-xs text-gray-400 mt-1">Si ya tienes un código asignado, introdúcelo aquí. Si lo dejas vacío se genera uno automáticamente.</p>
          </div>

          {/* Datos comprador / destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-400 mb-3">Comprador <span className="normal-case text-gray-300">(opcional — solo si ya está vendido)</span></p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input type="text" value={form.buyerName}
                    onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.buyerEmail}
                    onChange={(e) => setForm((f) => ({ ...f, buyerEmail: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-gray-400 mb-3">Destinatario <span className="normal-case text-gray-300">(si es diferente)</span></p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input type="text" value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.recipientEmail}
                    onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dedicatoria</label>
              <textarea value={form.message} rows={3}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Mensaje personalizado..."
                className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha de envío</label>
              <input type="date" value={form.sendDate}
                onChange={(e) => setForm((f) => ({ ...f, sendDate: e.target.value }))}
                className="border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Guardando..." : form.customCode ? `Guardar ${form.customCode.toUpperCase()} (${finalAmount || "—"}€)` : `Guardar bono de ${finalAmount || "—"}€`}
            </button>
            <button type="button" onClick={() => setTab("list")} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* ── Carga masiva ──────────────────────────────────────────────────────── */}
      {tab === "bulk" && (
        <div className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="font-serif font-light text-xl border-b border-gray-100 pb-4">Carga masiva de bonos</h2>

          <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-2">
            <p className="font-medium text-gray-700">Formato CSV (separado por comas):</p>
            <p className="font-mono text-xs bg-white border border-gray-200 px-3 py-2 whitespace-pre">
{`codigo,importe,nombre,email,destinatario,email_destinatario,mensaje
GUNNEN-ABCD-1234,100,Juan García,juan@email.com,,,
GUNNEN-WXYZ-5678,150,María López,maria@email.com,Pedro López,pedro@email.com,Feliz cumpleaños`}
            </p>
            <p className="text-xs text-gray-400">Las columnas <strong>codigo</strong> e <strong>importe</strong> son obligatorias. El resto son opcionales.</p>
          </div>

          {/* File upload */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="btn-secondary cursor-pointer text-sm">
              Subir archivo CSV
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvFile} />
            </label>
            <span className="text-gray-400 text-sm">o pega el texto directamente:</span>
          </div>

          {/* Textarea paste */}
          <textarea
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); parseBulkCsv(e.target.value); }}
            rows={6}
            placeholder={"codigo,importe,nombre,email\nGUNNEN-ABCD-1234,100,Juan García,juan@email.com"}
            className="w-full border border-gray-200 px-3 py-2 font-mono text-xs focus:outline-none focus:border-primary resize-y"
          />

          {bulkError && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 whitespace-pre-line">{bulkError}</div>
          )}

          {bulkResult && (
            <div className="bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✓ Importados: <strong>{bulkResult.created}</strong> bonos.
              {bulkResult.skipped > 0 && <> <strong>{bulkResult.skipped}</strong> omitidos (código duplicado).</>}
            </div>
          )}

          {/* Preview table */}
          {bulkRows.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-sm text-gray-500 mb-2">{bulkRows.length} bonos listos para importar:</p>
              <table className="w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Código", "Importe", "Comprador", "Email", "Destinatario"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-normal tracking-wider uppercase border-b border-gray-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bulkRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-medium">{row.code}</td>
                      <td className="px-3 py-2 font-medium">{row.amount}€</td>
                      <td className="px-3 py-2">{row.buyerName || "—"}</td>
                      <td className="px-3 py-2 text-gray-400">{row.buyerEmail || "—"}</td>
                      <td className="px-3 py-2">{row.recipientName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button
              onClick={handleBulkImport}
              disabled={bulkImporting || bulkRows.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {bulkImporting ? "Importando..." : `Importar ${bulkRows.length} bono${bulkRows.length !== 1 ? "s" : ""}`}
            </button>
            <button onClick={() => { setTab("list"); setBulkRows([]); setCsvText(""); setBulkResult(null); setBulkError(""); }} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Lista de bonos ────────────────────────────────────────────────────── */}
      {tab === "list" && (
        <div className="bg-white border border-gray-200 divide-y divide-gray-100">
          {giftCards.length === 0 ? (
            <p className="px-6 py-12 text-center text-gray-400">No hay bonos aún. Crea el primero o usa la carga masiva.</p>
          ) : (
            giftCards.map((g) => {
              const { label, cls } = statusLabel(g.status);
              return (
                <div key={g.id} className="px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-mono font-medium tracking-wider text-sm">{g.code}</p>
                        <span className={`text-xs px-2 py-0.5 tracking-wider uppercase ${cls}`}>{label}</span>
                      </div>
                    <p className="text-sm text-gray-600">
                      {g.status === "AVAILABLE" ? (
                        <span className="text-gray-400 italic">Sin asignar — listo para venta</span>
                      ) : (
                        <>
                          De: <strong>{g.buyerName === "INVENTARIO" ? "—" : g.buyerName}</strong>
                          {g.recipientName !== g.buyerName && g.recipientName !== "INVENTARIO" && (
                            <> → Para: <strong>{g.recipientName}</strong> ({g.recipientEmail})</>
                          )}
                        </>
                      )}
                    </p>
                      {g.message && <p className="text-sm text-gray-400 italic mt-1">&ldquo;{g.message}&rdquo;</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Creado: {new Date(g.createdAt).toLocaleDateString("es-ES")}
                        {g.redeemedAt && ` · Canjeado: ${new Date(g.redeemedAt).toLocaleDateString("es-ES")}`}
                      </p>
                    </div>
                    <div className="text-right ml-6 flex-shrink-0">
                      <p className="text-2xl font-serif font-light">{g.amount}€</p>
                      {g.numberOfPeople && g.numberOfPeople > 1 && (
                        <p className="text-xs text-gray-400">{g.numberOfPeople} personas</p>
                      )}
                      {g.menuName && g.status !== "AVAILABLE" && (
                        <p className="text-xs text-gray-500 mt-0.5">{g.menuName}</p>
                      )}
                      {g.status !== "AVAILABLE" && (
                        <a
                          href={`/api/admin/giftcards/${g.id}/pdf`}
                          download={`Bono-${g.code}.pdf`}
                          className="mt-2 block text-xs tracking-wider uppercase text-gray-400 hover:text-primary transition-colors"
                        >
                          ↓ Descargar PDF
                        </a>
                      )}
                      {g.status === "ACTIVE" && (
                        <button onClick={() => handleRedeem(g.id)}
                          className="mt-1 text-xs tracking-wider uppercase text-gray-400 hover:text-primary transition-colors">
                          Marcar canjeado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
