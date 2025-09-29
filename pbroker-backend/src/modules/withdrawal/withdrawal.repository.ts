import prisma from "../../common/config/db.js";
import {
  TransactionStatus,
  WalletType,
  type Prisma,
  type Withdrawal,
} from "../../generated/prisma/index.js";

export class WithdrawalRepository {
  static async createAndDebitUser(
    withdrawalData: Prisma.WithdrawalUncheckedCreateInput,
    userId: number,
    amountToDebit: Prisma.Decimal
  ): Promise<Withdrawal> {
    return prisma.$transaction(async (tx) => {
      
      await tx.wallet.update({
        where: { userId_type: { userId, type: WalletType.TRADING } },
        data: { balance: { decrement: amountToDebit } },
      });

      return tx.withdrawal.create({ data: withdrawalData });
    });
  }
  static async findById(id: string): Promise<Withdrawal | null> {
    return prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
  static async count(where: Prisma.WithdrawalWhereInput): Promise<number> {
    return prisma.withdrawal.count({ where });
  }
  static async findMany(
    where?: Prisma.WithdrawalWhereInput,
    orderBy?: Prisma.WithdrawalOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Withdrawal[]> {
    return prisma.withdrawal.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
  static async findAll() {
    return prisma.withdrawal.findMany();
  }
  static async findByUserId(userId: number) {
    return prisma.withdrawal.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
  static async rejectAndRefund(
    id: string,
    userId: number,
    refundAmount: Prisma.Decimal,
    adminNotes?: string
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId_type: { userId, type: WalletType.TRADING } },
        data: { balance: { increment: refundAmount } },
      });

      return tx.withdrawal.update({
        where: { id },
        data: {
          status: TransactionStatus.REJECTED,
          adminNotes,
        },
      });
    });
  }
  static async approve(
    id: string,
    transactionHash?: string,
    adminNotes?: string
  ) {
    return prisma.withdrawal.update({
      where: { id },
      data: {
        status: TransactionStatus.APPROVED,
        adminNotes,
        transactionHash,
      },
    });
  }
}
