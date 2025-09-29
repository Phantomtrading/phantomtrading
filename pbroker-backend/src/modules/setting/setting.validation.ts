import z from "zod";
export const createSettingSchema = z.object({
    key: z.string().min(1, { message: 'Key is required and cannot be empty.' }),
    value: z.record(z.any()),
    description: z.string().min(1, { message: 'Description is required and cannot be empty.' })
});
export const updateSettingSchema = createSettingSchema.partial();
export type createSettingInput = z.infer<typeof createSettingSchema>;
export type updateSettingInput = z.infer<typeof updateSettingSchema>;
