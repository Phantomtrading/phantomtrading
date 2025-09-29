import type { Secret } from "jsonwebtoken";

export const JWT_ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET!;
export const JWT_REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_TOKEN_SECRET!;
export const PASSWORD_RESET_TOKEN_SECRETE:Secret = process.env.PASSWORD_RESET_TOKEN_SECRET!;
export const FRONTEND_URL=process.env.FRONTEND_URL!;
export const DEPOSIT_PROOF_UPLOAD_FOLDER_NAME = process.env.DEPOSIT_PROOF_UPLOAD_FOLDER_NAME!;

export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
export const EMAIL_FROM = process.env.EMAIL_FROM || "pbroker <noreply@pbroker.net>";
