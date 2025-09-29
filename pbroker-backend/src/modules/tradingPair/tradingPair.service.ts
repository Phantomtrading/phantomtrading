import {
  NotFoundError,
  ValidationError,
} from "../../common/error/index.error.js";
import { Prisma, type TradingPair } from "../../generated/prisma/index.js";
import { TradingPairRepository } from "./tradingPair.repository.js";
import type {
  CreateTradingPairInput,
  UpdateTradingPairInput,
} from "./tradingPair.validation.js";

export class TradingPairService {
  static async create(data: CreateTradingPairInput): Promise<TradingPair> {
    const symbolsToCheck = [data.baseCurrency, data.quoteCurrency];

    if (data.baseCurrency === data.quoteCurrency) {
      throw new ValidationError(
        "baseCurrency and quoteCurrency must be different."
      );
    }

    if (data.pairName !== `${data.baseCurrency}${data.quoteCurrency}`) {
      throw new ValidationError(
        "pairName must be baseCurrency and quoteCurrency concatenated."
      );
    }

    const allExist = await TradingPairRepository.symbolsExist(symbolsToCheck);
    if (!allExist) {
      throw new ValidationError(
        `Both baseCurrency and quoteCurrency must exist in system Cryptocurrency symbols.`
      );
    }

    const tradeOptionsData = data.tradeOptions.map((opt) => ({
      durationSeconds: opt.durationSeconds,
      profitPercentage: opt.profitPercentage,
      minAmountQuote: opt.minAmountQuote,
      maxAmountQuote: opt.maxAmountQuote,
    }));

    const { tradeOptions, ...tradingPairData } = data;

    return await TradingPairRepository.create({
      ...tradingPairData,
      tradeOptions: {
        create: tradeOptionsData,
      },
    });
  }
  static async getAll(): Promise<TradingPair[]> {
    return TradingPairRepository.findAll();
  }
  static async getById(id: number): Promise<TradingPair> {
    const record = await TradingPairRepository.findById(id);
    if (!record) {
      throw new NotFoundError(`TradingPair with id ${id} not found`);
    }
    return record;
  }
  static async update(
    id: number,
    data: UpdateTradingPairInput
  ): Promise<TradingPair> {
    const existing = await TradingPairRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`TradingPair with id ${id} not found`);
    }

    // If updating tradeOptions, handle nested writes (replace or update tradeOptions)
    let tradeOptionsUpdate;
    if (data.tradeOptions) {
      // Simple approach: delete all existing options and recreate
      tradeOptionsUpdate = {
        deleteMany: {},
        create: data.tradeOptions.map((opt) => ({
          durationSeconds: opt.durationSeconds,
          profitPercentage: opt.profitPercentage,
          minAmountQuote: opt.minAmountQuote,
          maxAmountQuote: opt.maxAmountQuote,
        })),
      };
    }

    const { tradeOptions, ...restData } = data;

    return TradingPairRepository.update(id, {
      ...restData,
      ...(tradeOptionsUpdate ? { tradeOptions: tradeOptionsUpdate } : {}),
    });
  }
  static async delete(id: number): Promise<TradingPair> {
    try {
      return await TradingPairRepository.delete(id);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError(`TradingPair with id ${id} not found`);
      }
      throw err;
    }
  }
}
