import prisma from "../../common/config/db.js";
import {
  TradeStatus,
  WalletType,
  WinLoseStatus,
  type TradeRequest,
} from "../../generated/prisma/index.js";
import { Decimal } from "../../generated/prisma/runtime/library.js";
import type {
  CreateTradeRequestWithSnapshots,
  UpdateTradeRequestInput,
} from "./tradeRequest.validation.js";

export class TradeRequestRepository {
  static async createTradeWithBalanceUpdate(
    input: CreateTradeRequestWithSnapshots,
    userId: number,
    options: {
      tradingAmountBase: Decimal;
      expectedProfitQuote: Decimal;
      feePercentage: Decimal;
      feeAmount: Decimal;
      potentialProfitPercentage: Decimal;
      tradeStatus: TradeStatus;
      winLoseStatus: WinLoseStatus;
    }
  ): Promise<TradeRequest> {
    const {
      tradingAmountBase,
      expectedProfitQuote,
      feePercentage,
      feeAmount,
      potentialProfitPercentage,
      tradeStatus,
      winLoseStatus,
    } = options;

    return prisma.$transaction(async (tx) => {
      const trade = await tx.tradeRequest.create({
        data: {
          userId,
          tradingPair: input.tradingPair,
          baseCurrency: input.baseCurrency!,
          quoteCurrency: input.quoteCurrency!,
          tradeType: input.tradeType,
          tradingAmountQuote: input.tradingAmountQuote,
          tradingAmountBase,
          executionPrice: input.executionPrice,
          tradeExpirationTimeSeconds: input.tradeExpirationTimeSeconds,
          potentialProfitPercentage,
          expectedProfitQuote,
          transactionFeePercentage: feePercentage,
          transactionFeeAmountQuote: feeAmount,
          tradeStatus,
          winLoseStatus,
        },
      });

      let netChange = new Decimal(0).minus(feeAmount); // Always subtract fee

      if (winLoseStatus === WinLoseStatus.WIN) {
        netChange = netChange.plus(
          new Decimal(input.tradingAmountQuote).plus(expectedProfitQuote)
        );
      } else {
        netChange = netChange.minus(new Decimal(input.tradingAmountQuote));
      }
      await tx.wallet.update({
        where: {
          userId_type: {
            userId,
            type: WalletType.TRADING,
          },
        },
        data: {
          balance: netChange.gte(0)
            ? { increment: netChange }
            : { decrement: netChange.abs() },
        },
      });

      return trade;
    });
  }
  static async findAll() {
    return prisma.tradeRequest.findMany({
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
  static async findById(id: string, tx = prisma): Promise<TradeRequest | null> {
    return tx.tradeRequest.findUnique({
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
  static async findByUserId(
    userId: number,
    tx = prisma
  ): Promise<TradeRequest[]> {
    return tx.tradeRequest.findMany({
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
  static async updateTradeWithBalanceAdjustment(
    existing: TradeRequest,
    input: UpdateTradeRequestInput
  ) {
    return prisma.$transaction(async (tx) => {
      let adjustmentAmount = 0;

      if (input.tradeStatus === TradeStatus.CANCELLED) {
        // Full refund including fee
        adjustmentAmount =
          existing.tradingAmountQuote.toNumber() +
          existing.transactionFeeAmountQuote.toNumber();
      }

      if (input.winLoseStatus === WinLoseStatus.WIN) {
        // Refund only principal + profit, fee is not refunded
        adjustmentAmount =
          existing.tradingAmountQuote.toNumber() +
          existing.expectedProfitQuote.toNumber();
      }

      // LOSE → no refund
      
      if (adjustmentAmount > 0) {
        await tx.wallet.update({
          where: {
            userId_type: {
              userId: existing.userId,
              type: WalletType.TRADING,
            },
          },
          data: {
            balance: {
              increment: adjustmentAmount,
            },
          },
        });
      }

      return tx.tradeRequest.update({
        where: { id: existing.id },
        data: input,
      });
    });
  }
}
