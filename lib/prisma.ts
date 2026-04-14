// Comentado temporalmente para demo visual
// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//   });

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Mock temporal para demo visual
export const prisma = {
  userAdmin: {
    findUnique: async () => null,
    findMany: async () => [],
  },
  availabilityDay: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  timeSlot: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  reservation: {
    count: async () => 0,
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async () => ({ id: 'demo' }),
    update: async () => ({}),
  },
  payment: {
    findUnique: async () => null,
    create: async () => ({}),
  },
  coupon: {
    findUnique: async () => null,
  },
  giftCard: {
    count: async () => 0,
    findUnique: async () => null,
    create: async () => ({ id: 'demo', code: 'DEMO-1234-5678' }),
  },
  pressPost: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
  },
  cancelPolicyRule: {
    findMany: async () => [],
  },
  $disconnect: async () => {},
} as any;
