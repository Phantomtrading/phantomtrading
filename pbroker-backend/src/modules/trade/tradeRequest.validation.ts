import { z } from "zod";
import { TradeStatus } from "../../generated/prisma/index.js";

export const createTradeRequestSchema = z.object({
  tradingPairId: z.number().int().positive(), 
  tradeOptionId: z.number().int().positive(), 
  tradeType: z.enum(["BUY", "SELL"]),
  tradingAmountQuote: z.number().positive(),
  executionPrice: z.number().positive(),
});


export const updateTradeRequestSchema = z
  .object({
    tradeStatus: z.enum(["RESOLVED", "CANCELLED"]),
    winLoseStatus: z.enum(["WIN", "LOSE"]).optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Always require tradeStatus
    if (!data.tradeStatus) {
      ctx.addIssue({
        path: ["tradeStatus"],
        code: z.ZodIssueCode.custom,
        message: "tradeStatus is required",
      });
      return;
    }

    // 2. RESOLVED => must include winLoseStatus
    if (data.tradeStatus === "RESOLVED" && !data.winLoseStatus) {
      ctx.addIssue({
        path: ["winLoseStatus"],
        code: z.ZodIssueCode.custom,
        message: "winLoseStatus is required when tradeStatus is RESOLVED",
      });
    }

    // 3. CANCELLED => must NOT include winLoseStatus
    if (data.tradeStatus === "CANCELLED" && data.winLoseStatus !== undefined) {
      ctx.addIssue({
        path: ["winLoseStatus"],
        code: z.ZodIssueCode.custom,
        message: "winLoseStatus must not be included when tradeStatus is CANCELLED",
      });
    }
  })
  .transform((data) => {
    if (data.tradeStatus === "RESOLVED") {
      return {
        tradeStatus: TradeStatus.RESOLVED,
        winLoseStatus: data.winLoseStatus,
      };
    }
    return {
      tradeStatus: TradeStatus.CANCELLED,
    };
  });


// Export inferred types for service/controller use
export type CreateTradeRequestInput = z.infer<typeof createTradeRequestSchema>;
export type UpdateTradeRequestInput = z.infer<typeof updateTradeRequestSchema>;

// Extended input for snapshot fields
export interface CreateTradeRequestWithSnapshots extends CreateTradeRequestInput {
  tradingPair: string; 
  baseCurrency: string; 
  quoteCurrency: string; 
  tradeExpirationTimeSeconds: number; 
}