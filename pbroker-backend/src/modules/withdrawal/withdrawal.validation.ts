import { z } from 'zod';
import { TransactionStatus } from '../../generated/prisma/index.js';

export const CreateWithdrawalSchema = z.object({
  withdrawalAddress: z.string()
    .min(26, { message: "Withdrawal address seems too short." })
    .max(100, { message: "Withdrawal address seems too long." }),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : (typeof val === 'number' ? val : undefined)),
    z.number()
      .positive({ message: "Amount must be positive." })
  )
});
export type CreateWithdrawalInput = z.infer<typeof CreateWithdrawalSchema>;


// Schema for updating withdrawal status (e.g., by an admin)
export const UpdateWithdrawalStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  transactionHash: z.string()
    .min(10, { message: "Transaction hash seems too short." })
    .optional(),
  adminNotes: z.string()
    .max(500, { message: "Admin note cannot exceed 500 characters." })
    .optional()
});
export type UpdateWithdrawalStatusInput = z.infer<typeof UpdateWithdrawalStatusSchema>;


// Schema for pagination and filtering query parameters
export const WithdrawalPaginationQuerySchema = z.object({
  page: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : undefined),
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : undefined),
    z.number().int().positive().optional().default(10)
  ),
  status: z.nativeEnum(TransactionStatus).optional(),
  userId: z.number().optional(), // For admin filtering
});
export type WithdrawalPaginationQueryInput = z.infer<typeof WithdrawalPaginationQuerySchema>;