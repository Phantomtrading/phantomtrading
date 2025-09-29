import { z } from "zod";

export const TradeOptionBaseSchema = z.object({
  tradingPairId: z.number(),
  durationSeconds: z.number().min(1),
  profitPercentage: z.number().min(0),
  minAmountQuote: z.number().min(0),
  maxAmountQuote: z.number().min(0),
});

export const CreateTradeOptionSchema = TradeOptionBaseSchema.refine(
  (data) => data.maxAmountQuote >= data.minAmountQuote,
  {
    message: "maxAmountQuote must be greater than or equal to minAmountQuote",
    path: ["maxAmountQuote"],
  }
);

export const UpdateTradeOptionSchema = TradeOptionBaseSchema.partial().refine(
  (data) =>
    data.minAmountQuote === undefined ||
    data.maxAmountQuote === undefined ||
    data.maxAmountQuote >= data.minAmountQuote,
  {
    message: "maxAmountQuote must be greater than or equal to minAmountQuote",
    path: ["maxAmountQuote"],
  }
);

export type CreateTradeOptionInput = z.infer<typeof CreateTradeOptionSchema>;
export type UpdateTradeOptionInput = z.infer<typeof UpdateTradeOptionSchema>;
