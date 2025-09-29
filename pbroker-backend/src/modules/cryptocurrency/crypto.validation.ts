import { z } from "zod";

export const CryptocurrencyInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  tokenStandard: z.string().min(1, "Token standard is required"),
  depositAddress: z.string().min(1, "Deposit address is required"),
  coingeckoId: z.string().min(1, "CoinGecko ID is required").optional(),
});

export const CryptoUpdateSchema = CryptocurrencyInputSchema.partial();


export const IdPathParamSchema = z.object({
  id: z.string().min(1, "Name is required"),
});

export type CryptocurrencyInput = z.infer<typeof CryptocurrencyInputSchema>;
export type CryptocurrencyUpdateValidatedInput = z.infer<typeof CryptoUpdateSchema>;
