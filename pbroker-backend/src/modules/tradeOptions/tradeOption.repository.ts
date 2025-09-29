import prisma from "../../common/config/db.js";
import type { CreateTradeOptionInput, UpdateTradeOptionInput } from "./tradeOption.validation.js";

export class TradeOptionRepository {
  static async create(data: CreateTradeOptionInput) {
    return prisma.tradeOption.create({ data });
  }
  static async findByTradingPairId(tradingPairId: number) {
    return prisma.tradeOption.findMany({ where: { tradingPairId } });
  }
  static async findById(id: number) {
    return prisma.tradeOption.findUnique({ where: { id } });
  }
  static async update(id: number, data: UpdateTradeOptionInput) {
    return prisma.tradeOption.update({ where: { id }, data });
  }
  static async delete(id: number) {
    return prisma.tradeOption.delete({ where: { id } });
  }
}
