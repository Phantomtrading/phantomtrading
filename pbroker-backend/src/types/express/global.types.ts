import { z } from "zod";
export const IdPathParamSchema = z.object({
  id: z
    .string()
    .min(1, "id is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "id must be a valid number",
    }),
});