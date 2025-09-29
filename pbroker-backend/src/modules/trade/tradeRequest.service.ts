import {
  AppError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/error/index.error.js";
import { ensureAuthorizedUser } from "../../common/util/auth.util.js";
import {
  DemoMode,
  Role,
  TradeStatus,
  WalletType,
  WinLoseStatus,
} from "../../generated/prisma/index.js";
import { Decimal } from "../../generated/prisma/runtime/library.js";
import type { RequestUser } from "../auth/auth.type.js";
import { TradeOptionRepository } from "../tradeOptions/tradeOption.repository.js";
import { TradingPairRepository } from "../tradingPair/tradingPair.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { TradeRequestRepository } from "./tradeRequest.repository.js";
import type {
  CreateTradeRequestInput,
  CreateTradeRequestWithSnapshots,
  UpdateTradeRequestInput,
} from "./tradeRequest.validation.js";

export class TradeRequestService {
  static async create(
    input: CreateTradeRequestInput,
    currentUser: RequestUser
  ) {
    const userId = currentUser.userId;

    const user = await UserRepository.findUserWithWalletsById(userId, WalletType.TRADING);
    if (!user) throw new NotFoundError("User not found");
    const tradingWallet = user.wallets[0];
  if (!tradingWallet) throw new BadRequestError("User can't trade. he hasn't trading wallet.");

    const pair = await TradingPairRepository.findById(input.tradingPairId);
    if (!pair || !pair.isActive)
      throw new BadRequestError("Trading pair is not active");

    const tradeOption = await TradeOptionRepository.findById(
      input.tradeOptionId
    );
    if (!tradeOption || tradeOption.tradingPairId !== input.tradingPairId) {
      throw new BadRequestError("Invalid or mismatched trade option.");
    }

    if (
      new Decimal(input.tradingAmountQuote).lt(tradeOption.minAmountQuote) ||
      new Decimal(input.tradingAmountQuote).gt(tradeOption.maxAmountQuote)
    ){
      throw new BadRequestError("Trading amount is out of allowed range");
    }

    if (tradingWallet.balance.lt(input.tradingAmountQuote)) {
      throw new BadRequestError("Insufficient balance");
    }

    const executionPrice = input.executionPrice;
    const tradingAmountBase = input.tradingAmountQuote / executionPrice;
    const expectedProfitQuote = new Decimal(input.tradingAmountQuote).mul(
      tradeOption.profitPercentage
    )
    const transactionFeePercentage = pair.defaultTransactionFeePercentage;
    const transactionFeeAmountQuote = new Decimal(input.tradingAmountQuote).mul(transactionFeePercentage);

    let tradeStatus: TradeStatus;
    let winLoseStatus: WinLoseStatus;
    switch (user.demoMode) {
      case DemoMode.WIN:
        tradeStatus = TradeStatus.RESOLVED;
        winLoseStatus = WinLoseStatus.WIN;
        break;
      case DemoMode.LOSE:
        tradeStatus = TradeStatus.RESOLVED;
        winLoseStatus = WinLoseStatus.LOSE;
        break;
      default:
        tradeStatus = TradeStatus.PENDING;
        winLoseStatus = WinLoseStatus.NA;
    }

    const enrichedInput: CreateTradeRequestWithSnapshots = {
      ...input,
      tradingPair: pair.pairName,
      baseCurrency: pair.baseCurrency,
      quoteCurrency: pair.quoteCurrency,
      tradeExpirationTimeSeconds: tradeOption.durationSeconds,
    };

    return TradeRequestRepository.createTradeWithBalanceUpdate(
      enrichedInput,
      userId,
      {
        tradingAmountBase: new Decimal(tradingAmountBase),
        expectedProfitQuote,
        feePercentage: transactionFeePercentage,
        feeAmount: new Decimal(transactionFeeAmountQuote),
        potentialProfitPercentage: tradeOption.profitPercentage,
        tradeStatus,
        winLoseStatus,
      }
    );
  }
  static async getAll() {
    return TradeRequestRepository.findAll();
  }
  static async getByUserId(requestedUserId: number, user: RequestUser) {
    ensureAuthorizedUser(requestedUserId, user);
    return TradeRequestRepository.findByUserId(requestedUserId);
  }
  static async getById(id: string, user: RequestUser) {
    const trade = await TradeRequestRepository.findById(id);
    if (!trade) throw new AppError("Trade request not found", 404);
    ensureAuthorizedUser(trade.userId, user);
    return trade;
  }
  static async update(
    id: string,
    user: RequestUser,
    input: UpdateTradeRequestInput
  ) {
    const existing = await TradeRequestRepository.findById(id);
    if (!existing) throw new NotFoundError("Trade request not found");
    if (existing.tradeStatus !== TradeStatus.PENDING) {
      throw new BadRequestError("Only pending trades can be updated");
    }

    if (input.tradeStatus === TradeStatus.CANCELLED) {
      ensureAuthorizedUser(existing.userId, user);
    }
    if (input.winLoseStatus) {
      if (user.role !== Role.ADMIN) {
        throw new ForbiddenError("Only admin can set win/lose status");
      }
    }
    return TradeRequestRepository.updateTradeWithBalanceAdjustment(
      existing,
      input
    );
  }
}
