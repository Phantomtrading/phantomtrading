import { z } from "zod";
import { DemoMode, Role } from "../../generated/prisma/index.js";
import { Decimal } from "../../generated/prisma/runtime/library.js";

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const UpdateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name is too short")
    .max(50, "First name is too long")
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(2, "last name is too short")
    .max(50, "last name is too long")
    .trim()
    .optional(),

  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email is too long")
    .toLowerCase()
    .optional(),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Invalid phone number format (e.g., +251912345678)"
    )
    .max(15, "Phone number is too long")
    .optional(),
});

export const ExtendedUpdateUserSchema = UpdateUserSchema.extend({
  balance: z.union([z.string(), z.number()])
  .transform((val) => new Decimal(val))
  .optional(),
  role: z.nativeEnum(Role).optional(),
  demoMode: z.nativeEnum(DemoMode).optional(),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ExtendedUpdateUserInput = z.infer<typeof ExtendedUpdateUserSchema>;
