import { z } from "zod";

// Validación de datos de reserva - Paso 4
export const reservationSchema = z.object({
  timeSlotId: z.string().min(1, "Seleccione un horario"),
  reservationDate: z.string().min(1, "Seleccione una fecha"),
  reservationTime: z.string().min(1, "Seleccione una hora"),
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono inválido"),
  numberOfPeople: z.number().min(1, "Mínimo 1 comensal").max(4, "Máximo 4 comensales"),
  observations: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  allergenNotes: z.string().optional(),
  couponCode: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar los términos y condiciones",
  }),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

// Validación de bono regalo
export const giftCardSchema = z.object({
  amount: z.number().min(50, "El importe mínimo es 50€").max(500, "El importe máximo es 500€"),
  purchaserName: z.string().min(2, "El nombre es requerido"),
  purchaserEmail: z.string().email("Email inválido"),
  recipientName: z.string().optional(),
  recipientEmail: z.string().email("Email del destinatario inválido"),
  message: z.string().max(500, "El mensaje es demasiado largo").optional(),
  sendDate: z.string().min(1, "Seleccione una fecha de envío"),
});

export type GiftCardFormData = z.infer<typeof giftCardSchema>;

// Validación de login admin
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Validación de cupón
export const couponSchema = z.object({
  code: z.string().min(3, "El código debe tener al menos 3 caracteres").toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().min(0),
  isActive: z.boolean().default(true),
  maxUses: z.number().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  minAmount: z.number().optional(),
});

export type CouponFormData = z.infer<typeof couponSchema>;
