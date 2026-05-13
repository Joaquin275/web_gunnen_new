/**
 * Base de datos simple basada en archivos JSON.
 * Funciona sin PostgreSQL — los datos persisten en disco.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function readFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

function writeFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── RESERVATIONS ────────────────────────────────────────────────────────────

export type ReservationStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";

/** Estado de la operación en Redsys */
export type RedsysStatus =
  | "NONE"           // Sin pago
  | "PENDING"        // Enviado a Redsys, esperando respuesta
  | "PREAUTHORIZED"  // Retención activa (TransactionType=1 aprobado)
  | "CAPTURED"       // Preautorización confirmada/cobrada (TransactionType=3)
  | "REJECTED"       // Rechazado por banco
  | "REFUNDED";      // Preautorización anulada

export interface Reservation {
  id: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  menuName: string;
  menuPrice: number;
  estimatedTotal: number;    // Total estimado (menuPrice × numberOfPeople)
  depositAmount: number;     // 30% del estimado en euros
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  observations: string;
  allergens: string[];
  allergenNotes: string;
  couponCode: string;
  status: ReservationStatus;
  // ── Campos Redsys / TPV Virtual ─────────────────────────────────────────
  redsysOrder: string;       // Ds_Order enviado a Redsys (único por transacción)
  redsysStatus: RedsysStatus; // Estado de la operación en el TPV
  redsysAuthCode: string;    // Ds_AuthorisationCode devuelto por Redsys
  redsysResponse: string;    // Ds_Response (código de respuesta del banco)
  redsysCapturedAt: string;  // Fecha/hora de captura si se confirma preautorización
  createdAt: string;
}

export const reservationsDb = {
  findAll: (): Reservation[] =>
    readFile<Reservation>("reservations.json").sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),

  findById: (id: string): Reservation | null =>
    readFile<Reservation>("reservations.json").find((r) => r.id === id) ?? null,

  findByDate: (date: string): Reservation[] =>
    readFile<Reservation>("reservations.json").filter((r) => r.reservationDate === date),

  create: (data: Omit<Reservation, "id" | "createdAt">): Reservation => {
    const all = readFile<Reservation>("reservations.json");
    const newItem: Reservation = {
      ...data,
      id: generateId("res"),
      createdAt: new Date().toISOString(),
    };
    writeFile("reservations.json", [...all, newItem]);
    return newItem;
  },

  update: (id: string, data: Partial<Reservation>): Reservation | null => {
    const all = readFile<Reservation>("reservations.json");
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    writeFile("reservations.json", all);
    return all[idx];
  },

  countToday: (): number => {
    const today = new Date().toISOString().split("T")[0];
    return readFile<Reservation>("reservations.json").filter(
      (r) => r.reservationDate === today && r.status !== "CANCELLED"
    ).length;
  },

  countTotal: (): number =>
    readFile<Reservation>("reservations.json").filter(
      (r) => r.status !== "CANCELLED"
    ).length,

  countPending: (): number =>
    readFile<Reservation>("reservations.json").filter(
      (r) => r.status === "PENDING_PAYMENT"
    ).length,
};

// ─── PRESS POSTS ─────────────────────────────────────────────────────────────

export interface PressPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  published: boolean;
  coverImage: string;
}

export const pressDb = {
  findAll: (): PressPost[] =>
    readFile<PressPost>("press.json").sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ),

  findPublished: (): PressPost[] =>
    pressDb.findAll().filter((p) => p.published),

  findBySlug: (slug: string): PressPost | null =>
    readFile<PressPost>("press.json").find((p) => p.slug === slug) ?? null,

  findById: (id: string): PressPost | null =>
    readFile<PressPost>("press.json").find((p) => p.id === id) ?? null,

  create: (data: Omit<PressPost, "id">): PressPost => {
    const all = readFile<PressPost>("press.json");
    const newItem: PressPost = { ...data, id: generateId("press") };
    writeFile("press.json", [...all, newItem]);
    return newItem;
  },

  update: (id: string, data: Partial<PressPost>): PressPost | null => {
    const all = readFile<PressPost>("press.json");
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    writeFile("press.json", all);
    return all[idx];
  },

  delete: (id: string): boolean => {
    const all = readFile<PressPost>("press.json");
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    writeFile("press.json", filtered);
    return true;
  },
};

// ─── GIFT CARDS ──────────────────────────────────────────────────────────────

export type GiftCardStatus = "ACTIVE" | "REDEEMED" | "EXPIRED";

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
  status: GiftCardStatus;
  sendDate: string;
  redeemedAt: string | null;
  createdAt: string;
}

export const giftCardsDb = {
  findAll: (): GiftCard[] =>
    readFile<GiftCard>("giftcards.json").sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),

  findByCode: (code: string): GiftCard | null =>
    readFile<GiftCard>("giftcards.json").find((g) => g.code === code) ?? null,

  findById: (id: string): GiftCard | null =>
    readFile<GiftCard>("giftcards.json").find((g) => g.id === id) ?? null,

  create: (data: Omit<GiftCard, "id" | "createdAt">): GiftCard => {
    const all = readFile<GiftCard>("giftcards.json");
    const newItem: GiftCard = {
      ...data,
      id: generateId("gc"),
      createdAt: new Date().toISOString(),
    };
    writeFile("giftcards.json", [...all, newItem]);
    return newItem;
  },

  redeem: (id: string): GiftCard | null => {
    const all = readFile<GiftCard>("giftcards.json");
    const idx = all.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], status: "REDEEMED", redeemedAt: new Date().toISOString() };
    writeFile("giftcards.json", all);
    return all[idx];
  },

  countActive: (): number =>
    readFile<GiftCard>("giftcards.json").filter((g) => g.status === "ACTIVE").length,
};

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  description: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export const couponsDb = {
  findAll: (): Coupon[] => readFile<Coupon>("coupons.json"),

  findByCode: (code: string): Coupon | null =>
    readFile<Coupon>("coupons.json").find(
      (c) => c.code === code.toUpperCase() && c.active
    ) ?? null,

  create: (data: Omit<Coupon, "id" | "createdAt" | "usedCount">): Coupon => {
    const all = readFile<Coupon>("coupons.json");
    const newItem: Coupon = {
      ...data,
      id: generateId("coup"),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    writeFile("coupons.json", [...all, newItem]);
    return newItem;
  },

  update: (id: string, data: Partial<Coupon>): Coupon | null => {
    const all = readFile<Coupon>("coupons.json");
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    writeFile("coupons.json", all);
    return all[idx];
  },

  delete: (id: string): boolean => {
    const all = readFile<Coupon>("coupons.json");
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;
    writeFile("coupons.json", filtered);
    return true;
  },

  incrementUsed: (code: string): void => {
    const all = readFile<Coupon>("coupons.json");
    const idx = all.findIndex((c) => c.code === code.toUpperCase());
    if (idx !== -1) {
      all[idx].usedCount += 1;
      writeFile("coupons.json", all);
    }
  },
};

// ─── TABLES (MESAS) ──────────────────────────────────────────────────────────

export interface Table {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  notes: string;
  createdAt: string;
}

export const tablesDb = {
  findAll: (): Table[] =>
    readFile<Table>("tables.json").sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),

  findById: (id: string): Table | null =>
    readFile<Table>("tables.json").find((t) => t.id === id) ?? null,

  create: (data: Omit<Table, "id" | "createdAt">): Table => {
    const all = readFile<Table>("tables.json");
    const newTable: Table = {
      ...data,
      id: generateId("table"),
      createdAt: new Date().toISOString(),
    };
    writeFile("tables.json", [...all, newTable]);
    return newTable;
  },

  update: (id: string, data: Partial<Table>): Table | null => {
    const all = readFile<Table>("tables.json");
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    writeFile("tables.json", all);
    return all[idx];
  },

  delete: (id: string): boolean => {
    const all = readFile<Table>("tables.json");
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    writeFile("tables.json", filtered);
    return true;
  },
};
