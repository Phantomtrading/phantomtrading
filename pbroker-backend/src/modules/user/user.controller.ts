import type { NextFunction, Response, Request } from "express";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import { UserService } from "./user.service.js";

export class UserController {
  // Create a new withdrawal request
  static async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      APIResponder.ok(res, users);
    } catch (error) {
      next(error);
    }
  }
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const authenticatedUser = req.user;
      const user = await UserService.getUserById(userId, authenticatedUser);
      APIResponder.ok(
        res,
        user,
        "USER_RETRIEVED",
        "User retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
  static async countUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const count = await UserService.countAllUsers();
      APIResponder.success(res, {
        code: "SUCCESS",
        message: "Total user count fetched successfully",
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;
    try {
      const user = await UserService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      APIResponder.updated(res, user, "Password updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async updateUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedUser = req.user;
      const user = await UserService.updateUserInfo(
        +req.params.id,
        authenticatedUser,
        req.body
      );
      APIResponder.ok(res, user, "User info updated");
    } catch (error) {
      next(error);
    }
  }
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    const userId = Number(req.params.id);
    try {
      await UserService.deleteUserById(userId);
      return APIResponder.deleted(res);
    } catch (error) {
      next(error);
    }
  }
}
