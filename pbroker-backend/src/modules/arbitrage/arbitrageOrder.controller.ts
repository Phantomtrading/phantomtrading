import type { Request, Response, NextFunction } from "express";
import { ArbitrageOrderService } from "./arbitrageOrder.service.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import type {
  ArbitrageOrderAdminQuery,
  ArbitrageOrderCreateInput,
} from "./arbitrageOrder.validation.js";

export class ArbitrageOrderController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      const data = req.body as ArbitrageOrderCreateInput;
      const { productId, amount } = data;

      const order = await ArbitrageOrderService.createOrder(
        authUser,
        productId,
        amount
      );

      APIResponder.created(res, order);
    } catch (err) {
      next(err);
    }
  }
  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      const { orderId } = req.params;

      const cancelledOrder = await ArbitrageOrderService.cancelOrder(
        authUser,
        orderId
      );

      APIResponder.updated(res, cancelledOrder);
    } catch (err) {
      next(err);
    }
  }
  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      const { userId=authUser.userId, status, page = 1, limit = 20 } = req.query as any;

      const filters = {
        status,
        page: Number(page),
        limit: Number(limit),
      };

      const orders = await ArbitrageOrderService.getUserOrders(
        authUser,
        Number(userId),
        filters
      );

      APIResponder.paginated(res, {
        data: orders,
        total: orders.length,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (err) {
      next(err);
    }
  }
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      const { orderId } = req.params;

      const order = await ArbitrageOrderService.getOrderById(authUser, orderId);

      APIResponder.ok(res, order);
    } catch (err) {
      next(err);
    }
  }
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as unknown as ArbitrageOrderAdminQuery;
      const { data, total } = await ArbitrageOrderService.getAll(filters);
      APIResponder.paginated(res, {
        data,
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      });
    } catch (err) {
      next(err);
    }
  }
}
