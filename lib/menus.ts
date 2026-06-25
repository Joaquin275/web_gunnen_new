export interface MenuConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  basePrice: number;
  maridajePrice: number;
  noloPrice: number;
  courses: string;
  duration: string;
  highlights: string[];
}

export interface HarmonyBreakdown {
  none: number;
  vino: number;
  nolo: number;
}

export const MENUS: Record<string, MenuConfig> = {
  tempo: {
    id: "tempo",
    name: "Tempo",
    displayName: "Menú TEMPO",
    description:
      "Nuestra invitación a entrar hasta la cocina, a olvidarte del reloj y de las prisas. Un recorrido más extenso por nuestra forma de entender la materia prima y el entorno.",
    basePrice: 100,
    maridajePrice: 45,
    noloPrice: 30,
    courses: "14 bocados (11 del mundo salado + 3 del mundo dulce)",
    duration: "Experiencia completa",
    highlights: ["14 bocados totales", "Pan + Petit fours incluido", "Armonía con vino (+45€)", "Armonía No/Low (+30€)"],
  },
  impulso: {
    id: "impulso",
    name: "Impulso",
    displayName: "Menú IMPULSO",
    description:
      "Nuestra versión más inmediata, una propuesta que puede funcionar como puerta de entrada o si no dispones de mucho tiempo. Cocina ágil, estacional y de producto.",
    basePrice: 80,
    maridajePrice: 45,
    noloPrice: 30,
    courses: "11 bocados (9 del mundo salado + 2 del mundo dulce)",
    duration: "Versión más ágil",
    highlights: ["11 bocados totales", "Pan + Petit fours incluido", "Armonía con vino (+45€)", "Armonía No/Low (+30€)"],
  },
};

export const MENU_LIST = Object.values(MENUS);

export function getMenuById(menuId: string | null | undefined): MenuConfig | null {
  if (!menuId) return null;
  return MENUS[menuId] ?? null;
}

export function getMenuBase(menuName: string | null | undefined): string | null {
  if (!menuName) return null;
  const upper = menuName.toUpperCase();
  if (upper.includes("TEMPO")) return "tempo";
  if (upper.includes("IMPULSO")) return "impulso";
  return null;
}

export function defaultHarmony(people: number): HarmonyBreakdown {
  return { none: people, vino: 0, nolo: 0 };
}

export function harmonySum(harmony: HarmonyBreakdown): number {
  return harmony.none + harmony.vino + harmony.nolo;
}

export function isHarmonyValid(people: number, harmony: HarmonyBreakdown): boolean {
  return harmonySum(harmony) === people && harmony.none >= 0 && harmony.vino >= 0 && harmony.nolo >= 0;
}

/** Ajusta el reparto cuando cambia el número de comensales */
export function adjustHarmonyForPeople(
  people: number,
  harmony: HarmonyBreakdown
): HarmonyBreakdown {
  const sum = harmonySum(harmony);
  if (sum === people) return harmony;
  if (sum < people) {
    return { ...harmony, none: harmony.none + (people - sum) };
  }
  let excess = sum - people;
  const next = { ...harmony };
  for (const key of ["none", "nolo", "vino"] as const) {
    if (excess <= 0) break;
    const reduce = Math.min(next[key], excess);
    next[key] -= reduce;
    excess -= reduce;
  }
  return next;
}

export function calcOrderTotal(menuId: string, people: number, harmony: HarmonyBreakdown): number {
  const menu = getMenuById(menuId);
  if (!menu) return 0;
  return (
    menu.basePrice * people +
    menu.maridajePrice * harmony.vino +
    menu.noloPrice * harmony.nolo
  );
}

export function formatHarmonySummary(harmony: HarmonyBreakdown): string {
  const parts: string[] = [];
  if (harmony.none > 0) parts.push(`Solo menú: ${harmony.none}`);
  if (harmony.vino > 0) parts.push(`Armonía vino: ${harmony.vino}`);
  if (harmony.nolo > 0) parts.push(`Armonía No/Low: ${harmony.nolo}`);
  return parts.length > 0 ? parts.join(" · ") : "Sin armonía";
}

export function formatHarmonyHtml(harmony: HarmonyBreakdown): string {
  const summary = formatHarmonySummary(harmony);
  if (summary === "Sin armonía") return "";
  return `<div class="row"><span class="lbl">Armonía</span><span class="val">${summary}</span></div>`;
}
