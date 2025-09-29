// src/utils/auth.ts

import { Role } from "../../generated/prisma/index.js";
import type { RequestUser } from "../../modules/auth/auth.type.js";
import { ForbiddenError } from "../error/index.error.js";

export function ensureAuthorizedUser(userIdToCheck: number, currentUser: RequestUser) {
  const isAdmin = currentUser.role === Role.ADMIN;
  const isSelf = currentUser.userId === userIdToCheck;

  if (!isAdmin && !isSelf) {
    throw new ForbiddenError("You are not authorized to access this resource");
  }
}

export function ensureSenderOrRecipientOrAdmin(
  senderId: number,
  recipientId: number,
  currentUser: RequestUser
) {
  const isAdmin = currentUser.role === Role.ADMIN;
  const isSender = currentUser.userId === senderId;
  const isRecipient = currentUser.userId === recipientId;

  if (!isAdmin && !isSender && !isRecipient) {
    throw new ForbiddenError("You are not authorized to access this transfer.");
  }
}