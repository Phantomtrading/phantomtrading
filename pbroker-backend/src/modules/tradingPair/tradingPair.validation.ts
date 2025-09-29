import { z } from "zod";
import {TradeOptionBaseSchema } from "../tradeOptions/tradeOption.validation.js";

export const createTradingPairSchema = z.object({
  pairName: z.string().min(3),
  baseCurrency: z.string().min(2),
  quoteCurrency: z.string().min(2),
  defaultTransactionFeePercentage: z.number().min(0).max(1).optional(),
  tradeOptions: z.array(TradeOptionBaseSchema.omit({ tradingPairId: true })).min(1),
  isActive: z.boolean().optional(),
});


export const updateTradingPairSchema = createTradingPairSchema.partial();

// TypeScript types inferred from Zod
export type CreateTradingPairInput = z.infer<typeof createTradingPairSchema>;
export type UpdateTradingPairInput = z.infer<typeof updateTradingPairSchema>;
