import { NotFoundError } from "../../common/error/index.error.js";
import { ensureAuthorizedUser } from "../../common/util/auth.util.js";
import {
  Prisma,
  Role,
  type ArbitrageTransactionStatus,
  type ArbitrageTransactionType,
} from "../../generated/prisma/index.js";
import type { Decimal } from "../../generated/prisma/runtime/library.js";
import type { RequestUser } from "../auth/auth.type.js";
import { ArbitrageTransactionRepository } from "./arbitrageTransaction.repository.js";

export class ArbitrageTransactionService {
  static async getTransaction(id: string, authUser: RequestUser) {
    const transaction = await ArbitrageTransactionRepository.findById(id);
    if (!transaction)
      throw new NotFoundError("Arbitrage transaction not found");
    ensureAuthorizedUser(transaction.userId, authUser);
    return transaction;
  }
  static async getAllTransactions(
    authUser: RequestUser,
    filter?: {
      userId?: number;
      orderId?: string;
      status?: ArbitrageTransactionStatus;
    },
    page: number = 1,
    limit: number = 10
  ) {
    if (filter?.userId) {
      ensureAuthorizedUser(filter.userId, authUser);
    } else {
      if (authUser.role !== Role.ADMIN) {
        filter = { ...filter, userId: authUser.userId };
      }
    }

    return ArbitrageTransactionRepository.findAll(filter, page, limit);
  }
  static async getUserTotalEarned(
    userId: number,
    authUser: RequestUser,
    orderId?: string
  ) {
    ensureAuthorizedUser(userId, authUser);
    return ArbitrageTransactionRepository.sumAmount({
      userId,
      orderId,
      type: "INTEREST",
    });
  }
  static async updateTransactionStatus(
    id: string,
    status: ArbitrageTransactionStatus
  ) {
    try {
      return await ArbitrageTransactionRepository.updateStatus(id, status);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Arbitrage transaction not found");
      }
      throw err;
    }
  }
  static async deleteTransaction(id: string) {
    try {
      await ArbitrageTransactionRepository.delete(id);
      return { message: "Arbitrage transaction deleted successfully" };
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Arbitrage transaction not found");
      }
      throw err;
    }
  }
  static async createTransaction(
    orderId: string,
    userId: number,
    amount: Decimal,
    type: ArbitrageTransactionType
  ) {
    return ArbitrageTransactionRepository.create({
      orderId,
      userId,
      amount,
      type,
    });
  }
}
