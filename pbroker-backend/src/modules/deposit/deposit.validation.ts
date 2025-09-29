// deposit.schema.ts
import { z } from "zod";

export const depositSchema = z.object({
  cryptocurrencyId: z.coerce.number(),
  amount: z.coerce.number(),
  transactionHash: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  adminNotes: z.string().optional(),
});

export const depositUpdateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

export type DepositValidatedInput = z.infer<typeof depositSchema>;
export type DepositUpdateStatusInput = z.infer<typeof depositUpdateStatusSchema>;