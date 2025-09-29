import { z } from "zod";
import { WalletType } from "../../generated/prisma/index.js";
import { decimalSchema } from "../arbitrage/arbitrageProduct.validation.js";

export const walletTransferSchema = z.object({
  from: z.nativeEnum(WalletType),
  to: z.nativeEnum(WalletType),
  amount: decimalSchema,
});

export const walletUpdateSchema = z.object({
  balance: decimalSchema,
});

export type WalletTransferInput = z.infer<typeof walletTransferSchema>;
export type WalletUpdateInput = z.infer<typeof walletUpdateSchema>;