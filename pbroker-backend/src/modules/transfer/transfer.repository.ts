import prisma from "../../common/config/db.js";
import { ValidationError } from "../../common/error/index.error.js";
import type { Prisma, User } from "../../generated/prisma/index.js";
import { WalletType } from "../../generated/prisma/index.js";
import type { TransferWithUsers } from "./transfer.types.js";
import type {
  PaginationOptions,
  TransferQueryOption,
} from "./transfer.validation.js";
export class TransferRepository {
  static async findAllTransfers(
    options: PaginationOptions,
    tx?: Prisma.TransactionClient
  ): Promise<{
    transfers: TransferWithUsers[];
    total: number;
    page: number;
    limit: number;
  }> {
    const client = tx || prisma;

    const page = options.page;
    const limit = options.limit;
    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      client.transfer.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      client.transfer.count(),
    ]);

    return { transfers, total, page, limit };
  }
  static async findTransferById(id: string): Promise<TransferWithUsers | null> {
    return prisma.transfer.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipient: {
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
  static async findTransfersByUserId(
    userId: number,
    options: TransferQueryOption,
    tx?: Prisma.TransactionClient
  ): Promise<{
    transfers: TransferWithUsers[];
    total: number;
    page: number;
    limit: number;
  }> {
    const client = tx || prisma;
    const { type, page, limit } = options;
    const skip = (page - 1) * limit;

    let whereCondition: Prisma.TransferWhereInput = {};

    if (type === "sent") {
      whereCondition = { senderId: userId };
    } else if (type === "received") {
      whereCondition = { recipientId: userId };
    } else {
      whereCondition = {
        OR: [{ senderId: userId }, { recipientId: userId }],
      };
    }

    const [transfers, total] = await Promise.all([
      client.transfer.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      client.transfer.count({ where: whereCondition }),
    ]);

    return { transfers, total, page, limit };
  }
  static async executeTransferInTransaction(
    senderId: number,
    recipientId: number,
    amount: Prisma.Decimal
  ): Promise<{
    sender: User;
    recipient: User;
    transferRecord: Prisma.TransferGetPayload<{}>;
  }> {
    return prisma.$transaction(
      async (tx) => {
        const [senderWallet, recipientWallet] = await Promise.all([
          tx.wallet.findUnique({
            where: {
              userId_type: { userId: senderId, type: WalletType.TRADING },
            },
          }),
          tx.wallet.findUnique({
            where: {
              userId_type: { userId: recipientId, type: WalletType.TRADING },
            },
          }),
        ]);

        if (!senderWallet) {
          throw new ValidationError("Sender trading wallet not found.");
        }

        if (!recipientWallet) {
          throw new ValidationError("Recipient trading wallet not found.");
        }
        if (senderWallet.balance.lessThan(amount)) {
          throw new ValidationError(
            "Insufficient funds detected during transaction."
          );
        }

        // Update wallets
        const [updatedSenderWallet, updatedRecipientWallet] = await Promise.all(
          [
            tx.wallet.update({
              where: {
                userId_type: { userId: senderId, type: WalletType.TRADING },
              },
              data: { balance: { decrement: amount } },
              select: { balance: true },
            }),
            tx.wallet.update({
              where: {
                userId_type: { userId: recipientId, type: WalletType.TRADING },
              },
              data: { balance: { increment: amount } },
              select: { balance: true },
            }),
          ]
        );

        const [sender, recipient] = await Promise.all([
          tx.user.findUniqueOrThrow({ where: { id: senderId } }),
          tx.user.findUniqueOrThrow({ where: { id: recipientId } }),
        ]);

        const transferRecord = await tx.transfer.create({
          data: {
            senderId: sender.id,
            recipientId: recipient.id,
            amount: amount,
          },
        });
        return {
          sender: {
            ...sender,
            balance: updatedSenderWallet.balance,
          },
          recipient: {
            ...recipient,
            balance: updatedRecipientWallet.balance,
          },
          transferRecord,
        };
      },
      {
        timeout: 10000,
      }
    );
  }
}
