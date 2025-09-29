import type { Request, Response, NextFunction } from "express";
import { ArbitrageTransactionService } from "./arbitrageTransaction.service.js";
import type { RequestUser } from "../auth/auth.type.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";
export class ArbitrageTransactionController {
  static async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user as RequestUser;
      const { id } = req.params;

      const transaction = await ArbitrageTransactionService.getTransaction(
        id,
        authUser
      );
      APIResponder.ok(res, transaction);
    } catch (err) {
      next(err);
    }
  }
  static async getAllTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authUser = req.user as RequestUser;

      const { userId, orderId, status, page = "1", limit = "20" } = req.query;

      const filter = {
        userId: userId ? Number(userId) : undefined,
        orderId: orderId ? String(orderId) : undefined,
        status: status as any,
      };

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const { data, total } =
        await ArbitrageTransactionService.getAllTransactions(
          authUser,
          filter,
          pageNum,
          limitNum
        );

      APIResponder.paginated(res, {
        data,
        total,
        page: pageNum,
        limit: limitNum,
      });
    } catch (err) {
      next(err);
    }
  }
  static async getUserTotalEarned(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authUser = req.user as RequestUser;

      const userId = Number(req.query.userId);
      const orderId = req.query.orderId ? String(req.query.orderId) : undefined;

      const totalEarnings = await ArbitrageTransactionService.getUserTotalEarned(
        userId,
        authUser,
        orderId
      );
      APIResponder.ok(res, {totalEarnings});
    } catch (err) {
      next(err);
    }
  }
}
