import { NotFoundError } from "../../common/error/index.error.js";
import { TradeOptionRepository } from "./tradeOption.repository.js";
import type {
  CreateTradeOptionInput,
  UpdateTradeOptionInput,
} from "./tradeOption.validation.js";
import { Prisma } from "../../generated/prisma/index.js";

export class TradeOptionService {
  static async create(data: CreateTradeOptionInput) {
    try {
      return await TradeOptionRepository.create(data);
    } catch (error: any) {
      if (error.code === "P2003") {
        throw new NotFoundError("Trading pair not found");
      }
      throw error;
    }
  }
  static async getByPairId(tradingPairId: number) {
    const options =
      await TradeOptionRepository.findByTradingPairId(tradingPairId);
    return options;
  }
  static async getById(id: number) {
    const option = await TradeOptionRepository.findById(id);
    if (!option) {
      throw new NotFoundError("Trade option not found");
    }
    return option;
  }
  static async update(id: number, data: UpdateTradeOptionInput) {
    try {
      return await TradeOptionRepository.update(id, data);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Trade option not found");
      }
      throw err;
    }
  }
  static async delete(id: number) {
    try {
      return await TradeOptionRepository.delete(id);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Trade option not found");
      }
      throw err;
    }
  }
}
