import { Prisma, WalletType} from "../../generated/prisma/index.js";
import { TransferRepository } from "./transfer.repository.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../../common/error/index.error.js";
import type {
  PaginationOptions,
  TransferQueryOption,
  ValidTransferInput,
} from "./transfer.validation.js";
import { UserRepository } from "../user/user.repository.js";
import type { RequestUser } from "../auth/auth.type.js";
import type { TransferWithUsers } from "./transfer.types.js";
import {
  ensureAuthorizedUser,
  ensureSenderOrRecipientOrAdmin,
} from "../../common/util/auth.util.js";

export class TransferService {
  static async initiateTransfer(senderId: number, data: ValidTransferInput) {
    const transferAmount = new Prisma.Decimal(data.amount);

    const sender = await UserRepository.findUserWithWalletsById(senderId, WalletType.TRADING);
    if (!sender) {
      throw new NotFoundError(`Sender with ID ${senderId} not found.`);
    }
    const senderWallet = sender.wallets[0];
      if (!senderWallet) throw new BadRequestError("User can't transfer. no fundings.");

    const recipient = await UserRepository.findUserByIdentifier(
      data.recipientIdentifier
    );
    if (!recipient) {
      throw new NotFoundError(
        `Recipient with identifier '${data.recipientIdentifier}' not found.`
      );
    }

    if (sender.id === recipient.id) {
      throw new ValidationError("Cannot transfer to self.");
    }

    if (senderWallet.balance.lessThan(transferAmount)) {
      throw new ValidationError("Sender has insufficient funds.");
    }

    try {
      const {
        sender: updatedSender,
        recipient: updatedRecipient,
        transferRecord,
      } = await TransferRepository.executeTransferInTransaction(
        sender.id,
        recipient.id,
        transferAmount
      );

      return {
        transferId: transferRecord.id,
        amount: transferRecord.amount,
        createdAt: transferRecord.createdAt,
        sender: {
          id: updatedSender.id,
          firstName: updatedSender.firstName,
          lastName: updatedSender.lastName,
          email: updatedSender.email,
        },
        recipient: {
          id: updatedRecipient.id,
          firstName: updatedRecipient.firstName,
          lastName: updatedRecipient.lastName,
          email: updatedRecipient.email,
        },
      };
    } catch (error) {
      throw new InternalServerError("Transfer failed. Please try again.");
    }
  }
  static async findAllTransfers(
    options: PaginationOptions,
    tx?: Prisma.TransactionClient
  ) {
    return TransferRepository.findAllTransfers(options, tx);
  }
  static async findTransferById(
    id: string,
    currentUser: RequestUser
  ): Promise<TransferWithUsers | null> {
    const transfer = await TransferRepository.findTransferById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer not found.");
    }
    ensureSenderOrRecipientOrAdmin(
      transfer.sender.id,
      transfer.recipient.id,
      currentUser
    );
    return transfer;
  }
  static async findTransfersByUserId(
    userId: number,
    currentUser: RequestUser,
    options: TransferQueryOption,
    tx?: Prisma.TransactionClient
  ) {
    ensureAuthorizedUser(userId, currentUser);
    return TransferRepository.findTransfersByUserId(userId, options, tx);
  }
}
