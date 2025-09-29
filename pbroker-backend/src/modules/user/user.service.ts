import {
  BadRequestError,
  NotFoundError,
} from "../../common/error/index.error.js";
import { ensureAuthorizedUser } from "../../common/util/auth.util.js";
import { Prisma, Role, type User } from "../../generated/prisma/index.js";
import type { RequestUser } from "../auth/auth.type.js";
import { UserRepository } from "./user.repository.js";
import bcrypt from "bcrypt";
import type { ExtendedUpdateUserInput } from "./user.validation.js";
type SafeUser = Omit<User, "password" | "createdAt" | "updatedAt">;
export class UserService {
  static async getUserById(
    id: number,
    currentUser: RequestUser
  ): Promise<SafeUser> {
    ensureAuthorizedUser(id, currentUser);
    const user = await UserRepository.findUserById(id);
    if (!user) throw new NotFoundError(`User with ID ${id} not found`);
    const { password, createdAt, updatedAt, ...safeUser } = user;
    return safeUser;
  }
  static async changePassword(
    userId: number,
    oldPass: string,
    newPass: string
  ): Promise<SafeUser> {
    const user = await UserRepository.findUserById(userId);
    if (!user || !(await bcrypt.compare(oldPass, user.password))) {
      throw new BadRequestError("Old password is incorrect");
    }
    const hashed = await bcrypt.hash(newPass, 12);
    const updatedUser = await UserRepository.updateUser(userId, {
      password: hashed,
    });
    const { password, createdAt, updatedAt, ...safeUser } = updatedUser;
    return safeUser;
  }
  static async getAllUsers(): Promise<SafeUser[]> {
    const users = await UserRepository.findAll();
    const safeUsers = users.map(
      ({ password, createdAt, updatedAt, ...rest }) => rest
    );
    return safeUsers;
  }
  static async updateUserInfo(
    userId: number,
    currentUser: RequestUser,
    data: ExtendedUpdateUserInput
  ) {
    ensureAuthorizedUser(userId, currentUser);
    const existingUser = await UserRepository.findUserById(userId);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }
    if (currentUser.role !== Role.ADMIN) {
      delete data.role;
      delete data.demoMode;
    }
    const updatedUser = await UserRepository.updateUser(userId, data);
    const { password, createdAt, updatedAt, ...safeUser } = updatedUser;
    return safeUser;
  }
  static async deleteUserById(userId: number) {
    try {
      return await UserRepository.deleteUser(userId);
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }
      throw err;
    }
  }
  static async countAllUsers(): Promise<number> {
    return UserRepository.countUsers();
  }
}
