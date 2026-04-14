// Mock de Prisma para demo visual sin base de datos

export const prisma = {
  userAdmin: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({}),
    update: async () => ({}),
  },
  availabilityDay: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
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
    create: async () => ({}),
    update: async () => ({}),
  },
  payment: {
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
  },
  coupon: {
    findUnique: async () => null,
    update: async () => ({}),
  },
  giftCard: {
    count: async () => 0,
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
  },
  pressPost: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
  },
  cancelPolicyRule: {
    findMany: async () => [],
  },
  settings: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  $disconnect: async () => {},
} as any;
