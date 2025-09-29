import prisma from "../../common/config/db.js";
import type { VerificationType } from "../../generated/prisma/index.js";

export class AuthRepository {
  static async createVerificationCode(
    userId: number,
    hashedCode: string,
    type: VerificationType,
    expiresInMinutes = 10
  ) {
    return prisma.verificationCode.create({
      data: {
        code: hashedCode,
        userId,
        type,
        expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      },
    });
  }
  static async findUserValidCodesByType(
    userId: number,
    type: VerificationType
  ) {
    return prisma.verificationCode.findFirst({
    where: {
      userId,
      type,
      expiresAt: { gt: new Date() }, // not expired
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  }
  static async deleteVerificationCode(id: number) {
    return prisma.verificationCode.delete({ where: { id } });
  }
  static async deleteUserVerificationCodesByType(userId: number, type:VerificationType) {
    return prisma.verificationCode.deleteMany({ where: { userId, type} });
  }
}
  

