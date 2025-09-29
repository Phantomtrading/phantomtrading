// tradingPair.repository.ts

import prisma from "../../common/config/db.js";
import type { Prisma, TradingPair } from "../../generated/prisma/index.js";

export class TradingPairRepository {
  static async create(
    data: Prisma.TradingPairCreateInput
  ): Promise<TradingPair> {
    return prisma.tradingPair.create({
      data,
      include: { tradeOptions: true },
    });
  }

  static async findAll(): Promise<TradingPair[]> {
    return prisma.tradingPair.findMany({
      include: { tradeOptions: true },
    });
  }

  static async findByPairName(pairName: string): Promise<TradingPair | null> {
    return prisma.tradingPair.findUnique({
      where: { pairName },
      include: { tradeOptions: true },
    });
  }

  static async findById(id: number): Promise<TradingPair | null> {
    return prisma.tradingPair.findUnique({
      where: { id },
      include: { tradeOptions: true },
    });
  }

  static async update(
    id: number,
    data: Prisma.TradingPairUpdateInput
  ): Promise<TradingPair> {
    // Note: Updating nested tradeOptions requires explicit nested writes.
    // Make sure data.tradeOptions uses nested operations like `create`, `update`, or `delete` appropriately.
    return prisma.tradingPair.update({
      where: { id },
      data,
      include: { tradeOptions: true },
    });
  }

  static async delete(id: number): Promise<TradingPair> {
    return prisma.tradingPair.delete({
      where: { id },
    });
  }

  static async symbolsExist(symbols: string[]): Promise<boolean> {
    const foundCurrencies = await prisma.cryptocurrency.findMany({
      where: { symbol: { in: symbols } },
      select: { symbol: true },
    });
    return foundCurrencies.length === symbols.length;
  }
}
