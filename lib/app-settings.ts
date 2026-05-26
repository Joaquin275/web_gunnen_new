import { prisma } from "@/lib/prisma";

export interface AppSettings {
  restaurantName: string;
  email: string;
  phone: string;
  address: string;
  depositMode: string;
  depositValue: string;
  cancelPolicy72h: string;
  cancelPolicy48h: string;
  cancelPolicy48_72h: string;
}

const DEFAULTS: AppSettings = {
  restaurantName: "Gunnen",
  email: "reservas@gunnen.es",
  phone: "",
  address: "Juan Díaz Porlier, 15, A Coruña",
  depositMode: "percentage",
  depositValue: "30",
  cancelPolicy72h: "100",
  cancelPolicy48h: "0",
  cancelPolicy48_72h: "100",
};

const KEY_MAP: Record<keyof AppSettings, string> = {
  restaurantName: "restaurant_name",
  email: "restaurant_email",
  phone: "restaurant_phone",
  address: "restaurant_address",
  depositMode: "deposit_mode",
  depositValue: "deposit_value",
  cancelPolicy72h: "cancel_policy_72h",
  cancelPolicy48h: "cancel_policy_48h",
  cancelPolicy48_72h: "cancel_policy_48_72h",
};

export async function getAppSettings(): Promise<AppSettings> {
  const keys = Object.values(KEY_MAP);
  const rows = await prisma.settings.findMany({ where: { key: { in: keys } } });
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    restaurantName: byKey[KEY_MAP.restaurantName] ?? DEFAULTS.restaurantName,
    email: byKey[KEY_MAP.email] ?? DEFAULTS.email,
    phone: byKey[KEY_MAP.phone] ?? DEFAULTS.phone,
    address: byKey[KEY_MAP.address] ?? DEFAULTS.address,
    depositMode: byKey[KEY_MAP.depositMode] ?? DEFAULTS.depositMode,
    depositValue: byKey[KEY_MAP.depositValue] ?? DEFAULTS.depositValue,
    cancelPolicy72h: byKey[KEY_MAP.cancelPolicy72h] ?? DEFAULTS.cancelPolicy72h,
    cancelPolicy48h: byKey[KEY_MAP.cancelPolicy48h] ?? DEFAULTS.cancelPolicy48h,
    cancelPolicy48_72h: byKey[KEY_MAP.cancelPolicy48_72h] ?? DEFAULTS.cancelPolicy48_72h,
  };
}

export async function saveAppSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const entries = Object.entries(partial) as [keyof AppSettings, string][];

  await Promise.all(
    entries.map(([field, value]) =>
      prisma.settings.upsert({
        where: { key: KEY_MAP[field] },
        update: { value: String(value) },
        create: { key: KEY_MAP[field], value: String(value) },
      })
    )
  );

  return getAppSettings();
}
