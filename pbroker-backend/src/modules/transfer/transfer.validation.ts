
import { z } from 'zod';
import { baseQueryOptionSchema } from '../../types/zodschema/queryoption.schema.js';

const e164PhoneRegex = /^\+\d{1,3}\d{6,14}$/;

export const transferSchema = z.object({
  recipientIdentifier: z
    .string({
      required_error: 'Recipient identifier is required.',
      invalid_type_error: 'Recipient identifier must be a string.',
    })
    .min(1, 'Recipient identifier cannot be empty.')
    .refine(
      (value) => {
        const isEmail = z.string().email().safeParse(value).success;
        const isE164Phone = e164PhoneRegex.test(value);
        return isEmail || isE164Phone;
      },
      {
        message: 'Recipient identifier must be a valid email address or a phone number in E.164 format (e.g., +12345678900).',
      }
    ),
  amount: z
    .number({
      required_error: 'Amount is required.',
      invalid_type_error: 'Amount must be a number.',
    })
    .positive('Amount must be a positive number.')
    .min(5, 'Transfer amount must be at least $5.')
    
});

export const transferQueryOptionSchema = baseQueryOptionSchema.extend({
  type: z.enum(["sent", "received", "all"]).optional().default("all"),
});

export type TransferQueryOption = z.infer<typeof transferQueryOptionSchema>;

export type ValidTransferInput = z.infer<typeof transferSchema>;

export interface PaginationOptions {
  page: number;
  limit: number;
}