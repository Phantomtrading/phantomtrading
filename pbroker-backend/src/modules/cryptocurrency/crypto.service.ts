import { BadRequestError, NotFoundError } from "../../common/error/index.error.js";
import { Prisma, type Cryptocurrency } from "../../generated/prisma/index.js";
import { CryptocurrencyRepository } from "./crypto.repository.js";
import type { CryptocurrencyInput } from "./crypto.validation.js";

type SafeCrypto = Omit<Cryptocurrency, "createdAt" | "updatedAt">;

export class CryptocurrencyService {
  static async addCrypto(data: CryptocurrencyInput): Promise<SafeCrypto> {
    try {
      const { createdAt, updatedAt, ...rest } = await CryptocurrencyRepository.addCryptocurrency(data);
      return rest;
    } catch (error: any) {
      throw error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
        ? new BadRequestError(`Duplicate field(s): ${(error.meta?.target as string[]).join(', ')}`)
        : error;
    }
  }
  static async getAllCryptoCurrencies(): Promise<SafeCrypto[]> {
    const cryptos = await CryptocurrencyRepository.getAllCryptoCurrencies();
    return cryptos.map(({ createdAt, updatedAt, ...rest }) => rest);
  }
  static async getCryptoCurrencyById(id: number): Promise<SafeCrypto> {
    const crypto = await CryptocurrencyRepository.getCryptoCurrencyById(id);
    if (!crypto)
      throw new NotFoundError(`Cryptocurrency with ID ${id} not found`);
    const { createdAt, updatedAt, ...rest } = crypto;
    return rest;
  }
  static async updateCryptoCurrencyById(
    id: number,
    data: Partial<Omit<Cryptocurrency, "id" | "createdAt" | "updatedAt">>
  ): Promise<SafeCrypto> {
    try {
      const updated = await CryptocurrencyRepository.updateCryptoCurrencyById(
        id,
        data
      );
      const { createdAt, updatedAt, ...rest } = updated;
      return rest;
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError(`Cryptocurrency with ID ${id} not found`);
      }
      throw err;
    }
  }
  static async deleteCryptoCurrencyById(id: number): Promise<SafeCrypto> {
    try {
      const deleted =
        await CryptocurrencyRepository.deleteCryptoCurrencyById(id);
      const { createdAt, updatedAt, ...rest } = deleted;
      return rest;
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError(`Cryptocurrency with ID ${id} not found`);
      }
      throw err;
    }
  }
}
