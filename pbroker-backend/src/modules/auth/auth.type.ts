import type { Decimal } from "@prisma/client/runtime/library";
import type { Role } from "../../generated/prisma/index.js";

export type AuthSignUpResponse = {
  firstName: string;
  lastName: string;
  email:string;
};

export type UserPayload = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  balance?:Decimal;
  phoneNumber: string;
  role: Role;
};

export type AuthSignInResponseData = {
  accessToken: string;
  refreshToken?: string;
  user: UserPayload;
};

export type ResetPasswordResponse = {
  message: string; // e.g. "Password reset successfully"
};

export interface RequestUser {
  userId: number;
  role: Role
}