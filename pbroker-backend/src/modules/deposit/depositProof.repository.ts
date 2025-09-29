import prisma from "../../common/config/db.js";

export class DepositProofRepository {
    
  static async findByDepositId(depositId: string) {
    return prisma.depositProof.findMany({
      where: { depositId },
      orderBy: { createdAt: "asc" },
    });
  }

  static async deleteById(id: string) {
    return prisma.depositProof.delete({
      where: { id },
    });
  }

  static async create(data: { depositId: string; filename: string }) {
    return prisma.depositProof.create({ data });
  }

  static async getDepositWithUserId(depositId: string) {
    return prisma.deposit.findUnique({
      where: { id: depositId },
      select: {
        id: true,
        userId: true,
      },
    });
  }
}
