import { NotFoundError } from "../../common/error/index.error.js";
import { Prisma } from "../../generated/prisma/index.js";
import { ArbitrageProductRepository } from "./arbitrageProduct.repository.js";
import type {
  ArbitrageProductInput,
  ArbitrageProductUpdateInput,
} from "./arbitrageProduct.validation.js";

export class ArbitrageProductService {
  static async getAll(page: number = 1, limit: number = 15, isActive?: boolean) {
    return ArbitrageProductRepository.findAll(page, limit, isActive);
  }
  static async getById(id: string) {
    const product = await ArbitrageProductRepository.findById(id);
    if (!product) throw new NotFoundError("Arbitrage product not found");
    return product;
  }
  static async create(data: ArbitrageProductInput) {
    return ArbitrageProductRepository.create(data);
  }
  static async update(id: string, data: ArbitrageProductUpdateInput) {
    try {
      return await ArbitrageProductRepository.update(id, data);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      )
        throw new NotFoundError("Arbitrage product not found");
      throw err;
    }
  }
  static async delete(id: string) {
    try {
      return ArbitrageProductRepository.delete(id);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      )
        throw new NotFoundError("Arbitrage product not found");
      throw err;
    }
  }
}
