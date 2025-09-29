import z from "zod";
import { decimalSchema } from "./arbitrageProduct.validation.js";
export const arbitrageOrderStatusEnum = z.enum([
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const createArbitrageOrderSchema = z.object({
  productId: z.string().cuid(),
  amount: decimalSchema,
});

export const cancelArbitrageOrderSchema = z.object({
  id: z.string().cuid(),
});

export const arbitrageOrderQuerySchema = z.object({
  status: arbitrageOrderStatusEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const arbitrageOrderAdminQuerySchema = z.object({
  status: z.enum(["ACTIVE", "CANCELLED", "COMPLETED"]).optional(),
  userId: z.coerce.number().optional(),
  from: z.string().optional(), 
  to: z.string().optional(), 
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
});

export type ArbitrageOrderAdminQuery = z.infer<
  typeof arbitrageOrderAdminQuerySchema
>;

export type ArbitrageOrderCreateInput = z.infer<typeof createArbitrageOrderSchema>;