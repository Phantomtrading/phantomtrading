import prisma from "../../common/config/db.js";
import type { ArbitrageProduct, Prisma } from "../../generated/prisma/index.js";


export class ArbitrageProductRepository {
  static async create(data: Prisma.ArbitrageProductCreateInput): Promise<ArbitrageProduct> {
    return prisma.arbitrageProduct.create({ data });
  }
  static async findById(id: string): Promise<ArbitrageProduct | null> {
    return prisma.arbitrageProduct.findUnique({ where: { id } });
  }
  static async findAll(page: number, limit: number, isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};
    const [data, total] = await prisma.$transaction([
      prisma.arbitrageProduct.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.arbitrageProduct.count({ where }),
    ]);

    return { data, total };
  }
  static async update(id: string, data: Partial<ArbitrageProduct>): Promise<ArbitrageProduct> {
    return prisma.arbitrageProduct.update({ where: { id }, data });
  }

  static async delete(id: string): Promise<void> {
    await prisma.arbitrageProduct.delete({ where: { id } });
  }
}
