import prisma from "../../common/config/db.js";
import type { Cryptocurrency, Prisma } from "../../generated/prisma/index.js";

export class CryptocurrencyRepository {
  static async addCryptocurrency(
    data: Prisma.CryptocurrencyCreateInput
  ): Promise<Cryptocurrency> {
    return prisma.cryptocurrency.create({ data });
  }
  static async getAllCryptoCurrencies(): Promise<Cryptocurrency[]> {
    return prisma.cryptocurrency.findMany();
  }
  static async getCryptoCurrencyById(
    id: number
  ): Promise<Cryptocurrency | null> {
    return prisma.cryptocurrency.findUnique({ where: { id } });
  }
  static async findCryptosWithCoingeckoId(skip = 0, take = 15) {
    return prisma.cryptocurrency.findMany({
      where: { coingeckoId: { not: null } },
      skip,
      take,
      orderBy: { id: "asc" },
    });
  }
  static async countCryptosWithCoingeckoId() {
    return prisma.cryptocurrency.count({
      where: { coingeckoId: { not: null } },
    });
  }
  static async updateCryptoCurrencyById(
    id: number,
    data: Prisma.CryptocurrencyUpdateInput
  ): Promise<Cryptocurrency> {
    return prisma.cryptocurrency.update({
      where: { id },
      data,
    });
  }
  static async deleteCryptoCurrencyById(id: number): Promise<Cryptocurrency> {
    return prisma.cryptocurrency.delete({ where: { id } });
  }
  static async countCryptocurrencies(): Promise<number> {
    return prisma.cryptocurrency.count();
  }
}
