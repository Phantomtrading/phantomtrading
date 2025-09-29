import type { NextFunction, Response, Request } from "express";
import type { CreateWithdrawalInput } from "./withdrawal.validation.js";
import { WithdrawalService } from "./withdrawal.service.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";
export class WithdrawalController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data: CreateWithdrawalInput = req.body;
      const withdrawal = await WithdrawalService.create(userId, data);
      APIResponder.created(
        res,
        withdrawal,
        "Withdrawal request created successfully."
      );
    } catch (error) {
      next(error);
    }
  }
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const withdrawals = await WithdrawalService.findAll();
      APIResponder.ok(res, withdrawals);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authenticatedUser = req.user;
      const withdrawal = await WithdrawalService.getById(id, authenticatedUser);
      APIResponder.ok(res, withdrawal);
    } catch (error) {
      next(error);
    }
  }
  static async getUserWithdrawals(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = parseInt(req.params.userId);
      const authenticatedUser = req.user;
      const withdrawals = await WithdrawalService.getUserWithdrawals(
        userId,
        authenticatedUser
      );
      APIResponder.ok(res, withdrawals);
    } catch (error) {
      next(error);
    }
  }
  static async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const withdrawalId = req.params.id;
      const data = req.body;
      const withdrawals = await WithdrawalService.updateStatus(
        withdrawalId,
        data
      );
      APIResponder.updated(res, withdrawals);
    } catch (error) {
      next(error);
    }
  }
}
