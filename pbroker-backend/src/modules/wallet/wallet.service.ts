import prisma from "../../common/config/db.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/error/index.error.js";
import {
  Prisma,
  PrismaClient,
  WalletType,
  type Wallet,
} from "../../generated/prisma/index.js";
import type { Decimal } from "../../generated/prisma/runtime/library.js";
import { WalletRepository } from "./wallet.repository.js";

export class WalletService {
  static async getBalances(userId: number) {
    const trading = await WalletRepository.findByUserAndType(
      userId,
      WalletType.TRADING
    );
    const arbitrage = await WalletRepository.findByUserAndType(
      userId,
      WalletType.ARBITRAGE
    );

    if (!trading || !arbitrage) throw new NotFoundError("Wallets not found");

    const tradingTotal = trading.balance.add(trading.locked);
    const arbitrageTotal = arbitrage.balance.add(arbitrage.locked);
    const totalOverall = tradingTotal.add(arbitrageTotal);

    return {
      trading: {
        id:trading.id,
        balance: trading.balance,
        locked: trading.locked,
        total: tradingTotal,
      },
      arbitrage: {
        id:arbitrage.id,
        balance: arbitrage.balance,
        locked: arbitrage.locked,
        total: arbitrageTotal,
      },
      totalOverall,
    };
  }
  static async credit(userId: number, type: WalletType, amount: Decimal) {
    return prisma.$transaction(async (tx) => {
      await WalletRepository.updateBalance(userId, type, amount, "CREDIT", tx);
      return WalletRepository.findByUserAndType(userId, type, tx);
    });
  }
  static async debit(userId: number, type: WalletType, amount: Decimal) {
    return prisma.$transaction(async (tx) => {
      const wallet = await WalletRepository.findByUserAndType(userId, type, tx);
      if (!wallet) throw new NotFoundError("Wallet not found");
      if (amount.gt(wallet.balance))
        throw new BadRequestError("Insufficient balance");

      await WalletRepository.updateBalance(userId, type, amount, "DEBIT", tx);
      return WalletRepository.findByUserAndType(userId, type, tx);
    });
  }
  static async transfer(
    userId: number,
    from: WalletType,
    to: WalletType,
    amount: Decimal
  ) {
    if (from === to)
      throw new BadRequestError("Cannot transfer to the same wallet");

    return prisma.$transaction(async (tx) => {
      const [fromWallet, toWallet] = await Promise.all([
        WalletRepository.findByUserAndType(userId, from, tx),
        WalletRepository.findByUserAndType(userId, to, tx),
      ]);

      if (!fromWallet || !toWallet)
        throw new NotFoundError("Wallets not found");
      if (amount.gt(fromWallet.balance))
        throw new BadRequestError("Insufficient balance to transfer");

      const updatedFromWallet = await WalletRepository.updateBalance(
        userId,
        from,
        amount,
        "DEBIT",
        tx
      );

      const updatedToWallet = await WalletRepository.updateBalance(
        userId,
        to,
        amount,
        "CREDIT",
        tx
      );

      return {
        fromWallet: {
          id: updatedFromWallet.id,
          type:updatedFromWallet.type,
          balance: updatedFromWallet.balance,
          locked: updatedFromWallet.locked,
        },
        toWallet: {
          id: updatedToWallet.id,
          type:updatedToWallet.type,
          balance: updatedToWallet.balance,
          locked: updatedToWallet.locked,
        },
      };
    });
  }
  static async debitAndLock(
    userId: number,
    amount: Decimal,
    type: WalletType,
    client?: PrismaClient | Prisma.TransactionClient
  ) {
    return this.modifyWallet(userId, type, amount, "LOCK", client);
  }
  static async unlockAndCredit(
    userId: number,
    amount: Decimal,
    type: WalletType,
    client?: PrismaClient | Prisma.TransactionClient
  ) {
    return this.modifyWallet(userId, type, amount, "UNLOCK", client);
  }
  static async modifyWallet(
    userId: number,
    type: WalletType,
    amount: Decimal,
    operation: "LOCK" | "UNLOCK",
    client?: PrismaClient | Prisma.TransactionClient
  ): Promise<Wallet | null> {
    if (!client) {
      return prisma.$transaction((tx) =>
        this.modifyWallet(userId, type, amount, operation, tx)
      );
    }

    const wallet = await WalletRepository.findByUserAndType(
      userId,
      type,
      client
    );
    if (!wallet) throw new NotFoundError("Wallet not found");

    if (operation === "LOCK" && amount.gt(wallet.balance))
      throw new BadRequestError("Insufficient balance");
    if (operation === "UNLOCK" && amount.gt(wallet.locked))
      throw new BadRequestError("Insufficient locked funds");

    await WalletRepository.updateLocked(
      userId,
      type,
      amount,
      operation,
      client
    );

    return WalletRepository.findByUserAndType(userId, type, client);
  }
  static async updateWalletBalance(walletId: string, balance: Decimal) {
      try {
        return await WalletRepository.updatepdateWalletBalance(walletId, balance);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2025") {
          throw new NotFoundError("Wallet not found.");
        }
        throw err;
      }
    }
}
