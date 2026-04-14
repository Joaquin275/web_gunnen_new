import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Admin user
  const passwordHash = await bcrypt.hash("gunnen2024", 12);
  await prisma.userAdmin.upsert({
    where: { email: "admin@gunnen.es" },
    update: {},
    create: {
      email: "admin@gunnen.es",
      passwordHash,
      name: "Admin Gunnen",
    },
  });
  console.log("✅ Admin creado: admin@gunnen.es / gunnen2024");

  // Configuración inicial
  const settings = [
    { key: "deposit_mode", value: "percentage" },
    { key: "deposit_value", value: "30" },
    { key: "cancel_policy_72h", value: "100" },
    { key: "cancel_policy_48_72h", value: "100" },
    { key: "cancel_policy_48h", value: "0" },
    { key: "restaurant_name", value: "Gunnen" },
    { key: "restaurant_email", value: "info@gunnen.es" },
    { key: "restaurant_address", value: "Juan Díaz Porlier, 15, A Coruña" },
  ];

  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Configuración inicial cargada");

  console.log("🎉 Seed completado");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
