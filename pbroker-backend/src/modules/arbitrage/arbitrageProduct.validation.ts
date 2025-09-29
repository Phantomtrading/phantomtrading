import { z } from "zod";
import { Decimal } from "../../generated/prisma/runtime/library.js";

export const decimalSchema = z
  .union([z.string(), z.number()])
  .refine((val) => {
    const dec = new Decimal(val);
    return dec.greaterThan(0);
  }, "Must be a positive decimal")
  .transform((val) => new Decimal(val));

export const arbitrageProductSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(3),
  durationDays: z.number().int().positive(),
  isActive: z.boolean().optional(),
  dailyRoiRate: decimalSchema,
  minInvestment: decimalSchema,
  maxInvestment: decimalSchema,
}).strict();

export const arbitrageProductUpdateSchema = arbitrageProductSchema.partial();

export const arbitrageProductQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  isActive: z.boolean().optional(),
});

export type ArbitrageProductInput = z.infer<typeof arbitrageProductSchema>;
export type ArbitrageProductUpdateInput = z.infer<typeof arbitrageProductUpdateSchema>;
export type ArbitrageProductQuery = z.infer<typeof arbitrageProductQuerySchema>;