import prisma from "../../common/config/db.js";
import {
  Prisma,
  type ArbitrageTransactionStatus,
  type ArbitrageTransactionType,
} from "../../generated/prisma/index.js";
import type { Decimal } from "../../generated/prisma/runtime/library.js";

type ClaimedTx = {
  transaction_id: string;
  order_id: string;
  user_id: number;
  tx_date: Date;
};

export class ArbitrageTransactionRepository {
  static async create(
    data: {
      orderId: string;
      userId: number;
      amount: Decimal;
      transactionDate?: Date;
      type: ArbitrageTransactionType;
      status?: ArbitrageTransactionStatus;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.arbitrageTransaction.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        status: data.status || "PENDING",
        transactionDate: data.transactionDate || new Date(),
      },
    });
  }
  static async findById(id: string) {
    return prisma.arbitrageTransaction.findUnique({
      where: { id },
      include: { order: true, user: true },
    });
  }
  static async findAll(
  filter?: {
    userId?: number;
    orderId?: string;
    status?: ArbitrageTransactionStatus;
  },
  page:number = 1,
  limit:number = 10
) {
  const where: Prisma.ArbitrageTransactionWhereInput = {};

  if (filter?.userId) where.userId = filter.userId;
  if (filter?.orderId) where.orderId = filter.orderId;
  if (filter?.status) where.status = filter.status;

  const [data, total] = await Promise.all([
    prisma.arbitrageTransaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.arbitrageTransaction.count({ where }),
  ]);

  return { data, total };
}
  static async updateStatus(id: string, status: ArbitrageTransactionStatus) {
    return prisma.arbitrageTransaction.update({
      where: { id },
      data: { status },
    });
  }
  static async delete(id: string) {
    return prisma.arbitrageTransaction.delete({ where: { id } });
  }
  static async sumAmount(filter: {
    userId?: number;
    orderId?: string;
    type?: ArbitrageTransactionType;
  }) {
    const result = await prisma.arbitrageTransaction.aggregate({
      _sum: { amount: true },
      where: filter,
    });
    return result._sum.amount || 0;
  }
  static async processDueBatch(limit: number): Promise<number> {
    return prisma.$transaction(async (tx) => {
      const claimed = await this.claimTransactions(tx, limit);
      if (!claimed.length) return 0;

      await this.settleTransactions(tx, claimed);
      await this.creditWallets(tx, claimed);
      await this.bumpOrders(tx, claimed);
      await this.handleFinishedAndContinuingOrders(tx, claimed);

      return claimed.length;
    });
  }
  private static async claimTransactions(
    tx: Prisma.TransactionClient,
    limit: number
  ): Promise<ClaimedTx[]> {
    return tx.$queryRaw<ClaimedTx[]>`
      WITH claimed AS (
        SELECT t."id" AS transaction_id,
               t."orderId" AS order_id,
               t."userId" AS user_id,
               t."transactionDate" as tx_date
        FROM "ArbitrageTransaction" t
        WHERE t."status" = 'PENDING'
          AND t."transactionDate" <= NOW()
        ORDER BY t."transactionDate"
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      SELECT * FROM claimed;
    `;
  }
  private static async settleTransactions(
    tx: Prisma.TransactionClient,
    claimed: ClaimedTx[]
  ) {
    const txIds = claimed.map((r) => r.transaction_id);

    await tx.$executeRaw`
      UPDATE "ArbitrageTransaction" t
      SET "status" = 'SUCCESS',
          "amount" = o."amount" * o."dailyRoiRate"
      FROM "ArbitrageOrder" o
      WHERE t."id" = ANY(${txIds}::text[])
        AND o."id" = t."orderId";
    `;
  }
  private static async creditWallets(
    tx: Prisma.TransactionClient,
    claimed: ClaimedTx[]
  ) {
    const txIds = claimed.map((r) => r.transaction_id);

    await tx.$executeRaw`
      WITH sums AS (
        SELECT t."userId", SUM(o."amount" * o."dailyRoiRate")::numeric AS inc
        FROM "ArbitrageTransaction" t
        JOIN "ArbitrageOrder" o ON o."id" = t."orderId"
        WHERE t."id" = ANY(${txIds}::text[])
        GROUP BY t."userId"
      )
      UPDATE "Wallet" w
      SET "balance" = w."balance" + s.inc
      FROM sums s
      WHERE w."userId" = s."userId"
        AND w."type" = 'ARBITRAGE';
    `;
  }
  private static async bumpOrders(
    tx: Prisma.TransactionClient,
    claimed: ClaimedTx[]
  ) {
    const txIds = claimed.map((r) => r.transaction_id);

    await tx.$executeRaw`
      WITH sums AS (
        SELECT t."orderId", SUM(o."amount" * o."dailyRoiRate")::numeric AS inc
        FROM "ArbitrageTransaction" t
        JOIN "ArbitrageOrder" o ON o."id" = t."orderId"
        WHERE t."id" = ANY(${txIds}::text[])
        GROUP BY t."orderId"
      )
      UPDATE "ArbitrageOrder" o
      SET "earnedInterest" = o."earnedInterest" + s.inc
      FROM sums s
      WHERE o."id" = s."orderId";
    `;
  }
  private static async handleFinishedAndContinuingOrders(
    tx: Prisma.TransactionClient,
    claimed: ClaimedTx[]
  ) {
    const valuesList = Prisma.join(
      claimed.map(
        (r) => Prisma.sql`(${r.order_id}, ${r.tx_date.toISOString()})`
      )
    );

    const finished = await tx.$queryRaw<
      { order_id: string; user_id: number; principal: Prisma.Decimal }[]
    >`
      WITH v(order_id, tx_date) AS (VALUES ${valuesList})
      SELECT v.order_id, o."userId" AS user_id, o."amount" AS principal
      FROM v
      JOIN "ArbitrageOrder" o ON o."id" = v.order_id
      WHERE (v.tx_date::timestamp + INTERVAL '1 minute') > o."endDate";
    `;

    const toContinue = await tx.$queryRaw<
      { order_id: string; user_id: number; next_date: Date }[]
    >`
      WITH v(order_id, tx_date) AS (VALUES ${valuesList})
      SELECT v.order_id, o."userId" AS user_id, (v.tx_date::timestamp + INTERVAL '1 minute') AS next_date
      FROM v
      JOIN "ArbitrageOrder" o ON o."id" = v.order_id
      WHERE (v.tx_date::timestamp + INTERVAL '1 minute') <= o."endDate";
    `;

    if (finished.length) {
      const finishedIds = finished.map((f) => f.order_id);

      await tx.$executeRaw`
        UPDATE "ArbitrageOrder"
        SET "status" = 'COMPLETED'
        WHERE "id" = ANY(${finishedIds}::text[])
          AND "status" = 'ACTIVE';
      `;

      await tx.$executeRaw`
        WITH rel AS (
          SELECT o."userId", SUM(o."amount")::numeric AS principal_sum
          FROM "ArbitrageOrder" o
          WHERE o."id" = ANY(${finishedIds}::text[])
          GROUP BY o."userId"
        )
        UPDATE "Wallet" w
        SET "balance" = w."balance" + rel.principal_sum,
            "locked"  = w."locked"  - rel.principal_sum
        FROM rel
        WHERE w."userId" = rel."userId" AND w."type" = 'ARBITRAGE';
      `;
      const principalTxs = finished.map((f) => ({
        orderId: f.order_id,
        userId: f.user_id,
        amount: f.principal,
        type: "PRINCIPAL_RETURN" as const,
        status: "SUCCESS" as const,
        transactionDate: new Date()
      }));

      await tx.arbitrageTransaction.createMany({
        data: principalTxs,
        skipDuplicates: true,
      });
    }

    if (toContinue.length) {
      const nextTxs = toContinue.map((r) => ({
        orderId: r.order_id,
        userId: r.user_id,
        amount: 0, // will be set when processed
        type: "INTEREST" as const,
        status: "PENDING" as const,
        transactionDate: r.next_date,
      }));

      await tx.arbitrageTransaction.createMany({
        data: nextTxs,
        skipDuplicates: true,
      });
    }
  }
}
