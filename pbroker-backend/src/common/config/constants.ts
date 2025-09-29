import { Prisma } from "../../generated/prisma/index.js";

export const PASSWORD_RESET_EXPIRES_IN = 15;
export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const PLATFORM_WiTHDRAWAL_FEE = new Prisma.Decimal(0.01);