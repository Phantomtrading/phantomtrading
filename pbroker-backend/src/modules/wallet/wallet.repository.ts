import prisma from "../../common/config/db.js";
import { Prisma, type WalletType } from "../../generated/prisma/index.js";
import type { Decimal } from "../../generated/prisma/runtime/library.js";

export class WalletRepository {
  static async findByUserAndType(
    userId: number,
    type: WalletType,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.wallet.findUnique({
      where: { userId_type: { userId, type } },
    });
  }
  static async updateBalance(
    userId: number,
    type: WalletType,
    amount: Decimal,
    operation: "CREDIT" | "DEBIT",
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const data =
      operation === "CREDIT" ? { increment: amount } : { decrement: amount };
    return client.wallet.update({
      where: { userId_type: { userId, type } },
      data: { balance: data },
    });
  }
  static async updateLocked(
    userId: number,
    type: WalletType,
    amount: Decimal,
    operation: "LOCK" | "UNLOCK",
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.wallet.update({
      where: { userId_type: { userId, type } },
      data:
        operation === "LOCK"
          ? { locked: { increment: amount }, balance: { decrement: amount } }
          : { locked: { decrement: amount }, balance: { increment: amount } },
    });
  }
  static async updatepdateWalletBalance(
    walletId: string,
    balance: Decimal,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.wallet.update({
      where: { id: walletId },
      data: { balance }
    });
  }
}

