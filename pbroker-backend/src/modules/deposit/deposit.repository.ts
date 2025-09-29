// src/modules/deposit/deposit.repository.ts
import prisma from "../../common/config/db.js";
import {
  Prisma,
  TransactionStatus,
  WalletType,
  type Deposit,
} from "../../generated/prisma/index.js";

export class DepositRepository {
  static async create(data: Prisma.DepositCreateInput): Promise<Deposit> {
    return prisma.deposit.create({ data });
  }
  static async createWithProofs(
    data: Prisma.DepositCreateInput,
    filenames: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.create({
        data,
      });

      await tx.depositProof.createMany({
        data: filenames.map((name) => ({
          depositId: deposit.id,
          filename: name,
        })),
      });

      return tx.deposit.findUniqueOrThrow({
        where: { id: deposit.id },
        include: { proofs: true },
      });
    });
  }
  static async findById(id: string): Promise<Deposit | null> {
    return prisma.deposit.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cryptocurrency: {
          select: { id: true, name: true, symbol: true },
        },
      },
    });
  }
  static async findAll(): Promise<Deposit[]> {
    return prisma.deposit.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cryptocurrency: {
          select: { id: true, name: true, symbol: true },
        },
      },
    });
  }
  static async findByUserId(userId: number): Promise<Deposit[]> {
    return prisma.deposit.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cryptocurrency: {
          select: { id: true, name: true, symbol: true },
        },
      },
    });
  }
  static async findByCryptoId(cryptocurrencyId: number): Promise<Deposit[]> {
    return prisma.deposit.findMany({
      where: { cryptocurrencyId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cryptocurrency: {
          select: { id: true, name: true, symbol: true },
        },
      },
    });
  }
  static async findPending(): Promise<Deposit[]> {
    return prisma.deposit.findMany({
      where: { status: TransactionStatus.PENDING },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cryptocurrency: {
          select: { id: true, name: true, symbol: true },
        },
      },
    });
  }
  static async findApproved(): Promise<Deposit[]> {
    return prisma.deposit.findMany({
      where: { status: TransactionStatus.APPROVED },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cryptocurrency: {
          select: { id: true, name: true, symbol: true },
        },
      },
    });
  }
  static async updateStatusTransaction(
    id: string,
    status: TransactionStatus,
    adminNotes: string | undefined,
    userId: number,
    amount: number
  ): Promise<Deposit> {
    return prisma.$transaction(async (tx) => {
      const updatedDeposit = await tx.deposit.update({
        where: { id },
        data: {
          status,
          adminNotes,
        },
      });

      if (status === TransactionStatus.APPROVED) {
        await tx.wallet.update({
          where: {
            userId_type: {
              userId,
              type: WalletType.TRADING,
            },
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
      }

      return updatedDeposit;
    });
  }
  static async deleteById(id: string): Promise<Deposit> {
    return prisma.deposit.delete({ where: { id } });
  }
  static async countAll(): Promise<number> {
    return prisma.deposit.count();
  }
  static async countByStatus(status: TransactionStatus): Promise<number> {
    return prisma.deposit.count({ where: { status } });
  }
  static async totalAmountByUser(userId: number): Promise<number> {
    const result = await prisma.deposit.aggregate({
      where: { userId, status: TransactionStatus.APPROVED },
      _sum: { amount: true },
    });
    return result._sum.amount?.toNumber() ?? 0;
  }
  static getDepositWithUserId(depositId: string) {
    return prisma.deposit.findUnique({
      where: { id: depositId },
      select: { id: true, userId: true },
    });
  }
}
