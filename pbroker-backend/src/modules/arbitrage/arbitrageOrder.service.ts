import prisma from "../../common/config/db.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/error/index.error.js";
import { ensureAuthorizedUser } from "../../common/util/auth.util.js";
import {
  ArbitrageOrderStatus,
  WalletType,
} from "../../generated/prisma/index.js";
import { Decimal } from "../../generated/prisma/runtime/library.js";
import type { RequestUser } from "../auth/auth.type.js";
import { WalletService } from "../wallet/wallet.service.js";
import { ArbitrageOrderRepository } from "./arbitrageOrder.repository.js";
import type { ArbitrageOrderAdminQuery } from "./arbitrageOrder.validation.js";
import { ArbitrageProductService } from "./arbitrageProduct.service.js";
import { ArbitrageTransactionRepository } from "./arbitrageTransaction.repository.js";

export class ArbitrageOrderService {
  static async createOrder(
    authUser: RequestUser,
    productId: string,
    amount: Decimal
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await ArbitrageProductService.getById(productId);
      if(!product) throw new NotFoundError("Product not found");
      if (!product.isActive) throw new BadRequestError("Product inactive");

      if (
        amount.lt(product.minInvestment) ||
        amount.gt(product.maxInvestment)
      ) {
        throw new BadRequestError("Amount out of investment bounds");
      }

      await WalletService.debitAndLock(
        authUser.userId,
        amount,
        WalletType.ARBITRAGE,
        tx
      );

      const intervalMs =
        process.env.NODE_ENV === "PRODUCTION"
          ? 1000 * 60 * 60 * 24 // 1 day
          : 1000 * 60; // 1 minute (testing)
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + product.durationDays * intervalMs
      );

      const order = await ArbitrageOrderRepository.create(
        {
          userId: authUser.userId,
          productId,
          amount,
          dailyRoiRate: product.dailyRoiRate,
          durationDays: product.durationDays,
          startDate,
          endDate,
          earnedInterest: new Decimal(0),
          status: ArbitrageOrderStatus.ACTIVE,
        },
        tx
      );

      await ArbitrageTransactionRepository.create(
        {
          orderId: order.id,
          userId: authUser.userId,
          amount: new Decimal(0),
          type: "INTEREST",
          status: "PENDING",
          transactionDate: new Date(order.startDate.getTime() + intervalMs),
        },
        tx
      );

      return order;
    });
  }
  static async cancelOrder(authUser: RequestUser, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await ArbitrageOrderRepository.findById(orderId, tx);
      if (!order) {
        throw new NotFoundError("Order not found");
      }
      ensureAuthorizedUser(order.userId, authUser);

      if (order.status !== ArbitrageOrderStatus.ACTIVE) {
        throw new BadRequestError("Order cannot be cancelled");
      }
      await WalletService.unlockAndCredit(
        authUser.userId,
        order.amount,
        WalletType.ARBITRAGE,
        tx
      );
      const cancelledOrder = await ArbitrageOrderRepository.updateStatus(
        orderId,
        ArbitrageOrderStatus.CANCELLED,
        tx
      );
      return cancelledOrder;
    });
  }
  static async getAll(filters: ArbitrageOrderAdminQuery) {
    const from = filters.from ? new Date(filters.from) : undefined;
    const to = filters.to ? new Date(filters.to) : undefined;
    return ArbitrageOrderRepository.getAll({
      ...filters,
      from,
      to,
    });
  }
  static async getUserOrders(
    authUser: RequestUser,
    userId: number,
    filters: any
  ) {
    ensureAuthorizedUser(userId, authUser);
    return ArbitrageOrderRepository.findAllByUser(userId, filters);
  }
  static async getOrderById(authUser: RequestUser, id: string) {
    const order = await ArbitrageOrderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    ensureAuthorizedUser(order.userId, authUser);
    return order;
  }
}
