/**
 * Script para crear un usuario administrador
 * 
 * Uso: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n=== Crear Usuario Administrador ===\n');

  const email = await question('Email: ');
  const password = await question('Contraseña (mínimo 8 caracteres): ');
  const name = await question('Nombre (opcional): ');

  if (!email || !password) {
    console.error('❌ Email y contraseña son requeridos');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
  }

  try {
    // Verificar si el email ya existe
    const existing = await prisma.userAdmin.findUnique({
      where: { email },
    });

    if (existing) {
      console.error('❌ Ya existe un usuario con ese email');
      process.exit(1);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.userAdmin.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    console.log('\n✅ Usuario administrador creado exitosamente');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log('\n📍 Puedes iniciar sesión en: http://localhost:3000/admin/login\n');
  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
