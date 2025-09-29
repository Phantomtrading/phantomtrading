import { z } from "zod";

export const baseQueryOptionSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type BaseQueryOption = z.infer<typeof baseQueryOptionSchema>;