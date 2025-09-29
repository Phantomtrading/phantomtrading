import { z } from "zod";

export const AuthSignUpSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name is too short")
    .max(50, "First name is too long")
    .trim(),
  lastName: z
    .string()
    .min(2, "last name is too short")
    .max(50, "last name is too long")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email is too long")
    .toLowerCase(),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Invalid phone number format (e.g., +251912345678)"
    )
    .max(15, "Phone number is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
export const AuthSignInSchema = z.object({

  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email is too long")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
export const ResetPasswordSchema = z.object({
  key:z.coerce.number(),
  token: z
    .string(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const EmailSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email is too long")
    .toLowerCase(),
});


export const ForgotPasswordSchema = EmailSchema;
export const resendEmailVerificationCodeSchema = EmailSchema;
export const EmailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Confirmation code must be exactly 6 characters"),
});



export type validatedEmailInput = z.infer<typeof ForgotPasswordSchema>;
export type EmailVerificationValidatedInput = z.infer<typeof EmailVerificationSchema>;
export type AuthSignUpValidatedInput = z.infer<typeof AuthSignUpSchema>;
export type AuthSignInValidatedInput = z.infer<typeof AuthSignInSchema>;
export type ResetPasswordValidatedInput = z.infer<typeof ResetPasswordSchema>;
export type ForgotPasswordValidatedInput = z.infer<typeof ForgotPasswordSchema>;