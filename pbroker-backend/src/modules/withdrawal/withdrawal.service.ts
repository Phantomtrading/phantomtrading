import {
  BadRequestError,
  NotFoundError,
} from "../../common/error/index.error.js";
import { ensureAuthorizedUser } from "../../common/util/auth.util.js";
import {
  Prisma,
  TransactionStatus,
  WalletType,
  type Withdrawal,
} from "../../generated/prisma/index.js";
import type { RequestUser } from "../auth/auth.type.js";
import { SettingService } from "../setting/setting.service.js";
import { UserRepository } from "../user/user.repository.js";
import { WithdrawalRepository } from "./withdrawal.repository.js";
import type {
  CreateWithdrawalInput,
  UpdateWithdrawalStatusInput,
} from "./withdrawal.validation.js";

export class WithdrawalService {
  static async create(
    userId: number,
    data: CreateWithdrawalInput
  ): Promise<Withdrawal> {
    const user = await UserRepository.findUserWithWalletsById(
      userId,
      WalletType.TRADING
    );
    if (!user) throw new NotFoundError("User not found");

    const userWallet = user.wallets[0];
    if (!userWallet) throw new NotFoundError("Trading wallet not found");

    const withdrawalSetting = await SettingService.getSettingByKey("withdrawal_setting");
    const {
      min,
      max,
      fee: feeRate,
    } = withdrawalSetting.value as {
      min: string;
      max: string;
      fee: string;
    };

    const requestedAmount = new Prisma.Decimal(data.amount);

    if (requestedAmount.lessThan(min)) {
      throw new BadRequestError(`Minimum withdrawal amount is ${min}`);
    }
    if (requestedAmount.greaterThan(max)) {
      throw new BadRequestError(`Maximum withdrawal amount is ${max}`);
    }

    const fee = requestedAmount.mul(new Prisma.Decimal(feeRate));
    const totalDeduction = requestedAmount.plus(fee);

    if (userWallet.balance.lessThan(totalDeduction)) {
      throw new BadRequestError("Insufficient balance");
    }

    const prismaData: Prisma.WithdrawalUncheckedCreateInput = {
      userId,
      withdrawalAddress: data.withdrawalAddress,
      amount: requestedAmount,
      fee,
      status: TransactionStatus.PENDING,
    };
    return WithdrawalRepository.createAndDebitUser(
      prismaData,
      userId,
      totalDeduction
    );
  }
  static async findAll() {
    return WithdrawalRepository.findMany();
  }
  static async getById(
    withdrawalId: string,
    authenticatedUser: RequestUser
  ): Promise<Withdrawal | null> {
    const withdrawal = await WithdrawalRepository.findById(withdrawalId);
    if (!withdrawal) {
      return null;
    }
    ensureAuthorizedUser(withdrawal.userId, authenticatedUser);

    return withdrawal;
  }
  static async getUserWithdrawals(
    userId: number,
    authenticatedUser: RequestUser
  ): Promise<Withdrawal[] | null> {
    ensureAuthorizedUser(userId, authenticatedUser);
    const withdrawals = await WithdrawalRepository.findByUserId(userId);
    return withdrawals;
  }
  static async updateStatus(
    withdrawalId: string,
    data: UpdateWithdrawalStatusInput
  ): Promise<Withdrawal> {
    const withdrawal = await WithdrawalRepository.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundError("Withdrawal not found");

    if (
      withdrawal.status === TransactionStatus.APPROVED ||
      withdrawal.status === TransactionStatus.REJECTED
    ) {
      throw new BadRequestError(
        `Withdrawal already ${withdrawal.status.toLowerCase()}`
      );
    }

    if (data.status === TransactionStatus.REJECTED) {
      return WithdrawalRepository.rejectAndRefund(
        withdrawalId,
        withdrawal.userId,
        withdrawal.amount.plus(withdrawal.fee),
        data.adminNotes
      );
    }

    return WithdrawalRepository.approve(
      withdrawalId,
      data.transactionHash,
      data.adminNotes
    );
  }
}
