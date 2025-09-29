import prisma from "../../common/config/db.js";
import { WalletType, type Role, type User, type Wallet } from "../../generated/prisma/index.js";

export class UserRepository {
  static async findUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
  static async findUserWithWalletsById(
  id: number,
  type?: WalletType 
): Promise<User & { wallets: Wallet[] } | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      wallets: type
        ? {
            where: { type },
            take: 1,
          }
        : true,
    },
  });
  }
  static async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
  static async findUserByPhoneNumber(
    phoneNumber: string
  ): Promise<User | null> {
    return prisma.user.findUnique({ where: { phoneNumber } });
  }
  static async findUserByEmailOrPhone(
    email: string,
    phoneNumber: string
  ): Promise<Pick<User, "email" | "phoneNumber"> | null> {
    return prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
      select: { email: true, phoneNumber: true },
    });
  }
  static async findUserByIdentifier(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
    });
  }
  static async createUser(
    data: Omit<
      User,
      "id" | "emailVerified" | "role" | "createdAt" | "updatedAt" | "balance" | "demoMode"
    >
  ): Promise<User> {
   return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data });
    await tx.wallet.createMany({
      data: [
        { userId: user.id, type: WalletType.TRADING },
        { userId: user.id, type: WalletType.ARBITRAGE },
      ],
    });
    return user;
  });
  }
  static async deleteUser(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
  static async updateUser(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
  static async findUsersByRole(role: Role): Promise<User[]> {
    return prisma.user.findMany({ where: { role } });
  }
    static async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }
  static async countUsers(): Promise<number> {
    return prisma.user.count();
  }
  static async verifyUserEmailById(userId: number): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }
  static async updateUserPasswordByEmail(
    email: string,
    hashedPassword: string
  ): Promise<User> {
    return prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
  
}
