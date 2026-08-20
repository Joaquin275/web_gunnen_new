/**
 * Plazo de caducidad de preautorizaciones Redsys.
 *
 * Hasta julio 2026: 7 días.
 * Desde agosto 2026: 30 días (cambio aplicado en el TPV).
 */

const RULE_CHANGE_AT = new Date("2026-08-01T00:00:00+02:00");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getPreauthExpiryDays(confirmedAt: Date | string): number {
  const d = typeof confirmedAt === "string" ? new Date(confirmedAt) : confirmedAt;
  return d >= RULE_CHANGE_AT ? 30 : 7;
}

export function getPreauthAgeDays(confirmedAt: Date | string, now = Date.now()): number {
  const d = typeof confirmedAt === "string" ? new Date(confirmedAt) : confirmedAt;
  return Math.floor((now - d.getTime()) / MS_PER_DAY);
}

export function getPreauthWarnDays(expiryDays: number): number {
  // Aviso 5 días antes de caducar (o 2 días antes si el plazo es de 7).
  return expiryDays <= 7 ? 5 : expiryDays - 5;
}

export function getPreauthAgeInfo(confirmedAt: Date | string | null | undefined, now = Date.now()) {
  if (!confirmedAt) return null;
  const expiryDays = getPreauthExpiryDays(confirmedAt);
  const days = getPreauthAgeDays(confirmedAt, now);
  const warnDays = getPreauthWarnDays(expiryDays);
  return {
    days,
    expiryDays,
    warn: days >= warnDays && days < expiryDays,
    expired: days >= expiryDays,
  };
}
