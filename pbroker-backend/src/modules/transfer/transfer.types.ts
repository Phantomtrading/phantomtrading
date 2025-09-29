import type { Prisma } from "../../generated/prisma/index.js";

type UserSummary = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type TransferWithUsers = {
  id: string;
  amount: Prisma.Decimal;
  createdAt: Date;
  sender: UserSummary;
  recipient: UserSummary;
};