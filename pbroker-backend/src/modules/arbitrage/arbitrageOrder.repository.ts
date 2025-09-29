import prisma from "../../common/config/db.js";
import type {
  ArbitrageOrderStatus,
  Prisma,
} from "../../generated/prisma/index.js";
interface AdminFilters {
  status?: ArbitrageOrderStatus;
  userId?: number;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export class ArbitrageOrderRepository {
  static async create(data: any, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.arbitrageOrder.create({ data });
  }
  static async getAll(filters: AdminFilters) {
    const { status, userId, from, to, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;

    const orders = await prisma.arbitrageOrder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.arbitrageOrder.count({ where });

    return { data: orders, total };
  }
  static async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.arbitrageOrder.findUnique({ where: { id } });
  }
  static async findAllByUser(userId: number, filters: any) {
    return prisma.arbitrageOrder.findMany({
      where: { userId, ...(filters.status ? { status: filters.status } : {}) },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });
  }
  static async updateStatus(
    id: string,
    status: ArbitrageOrderStatus,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.arbitrageOrder.update({
      where: { id },
      data: { status },
    });
  }
}
