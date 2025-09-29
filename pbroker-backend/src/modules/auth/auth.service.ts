import {
  FRONTEND_URL,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "../../common/config/envVariables.js";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UnverifiedEmailError,
} from "../../common/error/index.error.js";
import { Role, VerificationType } from "../../generated/prisma/index.js";
import { AuthRepository } from "./auth.repository.js";
import type {
  AuthSignInResponseData,
  AuthSignUpResponse,
  ResetPasswordResponse,
  UserPayload,
} from "./auth.type.js";
import type {
  AuthSignInValidatedInput,
  AuthSignUpValidatedInput,
  ResetPasswordValidatedInput,
} from "./auth.validation.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  PASSWORD_RESET_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../common/config/constants.js";
import { UserRepository } from "../user/user.repository.js";
import { getEmailSubject } from "../../emails/subject.js";
import { sendEmail } from "../../emails/emailService.js";
import emailVerificationTemplate from "../../emails/templates/emailVerificationTemplate.js";
import resetPasswordTemplate from "../../emails/templates/resetPasswordTemplate.js";
export class AuthService {
  static async signup(
    data: AuthSignUpValidatedInput
  ): Promise<AuthSignUpResponse> {
    const { firstName, lastName, email, phoneNumber, password } = data;
    const user = await UserRepository.findUserByEmailOrPhone(
      email,
      phoneNumber
    );
    const conflictMessages: string[] = [];

    if (user?.email === email) {
      conflictMessages.push("Email already exists");
    }
    if (user?.phoneNumber === phoneNumber) {
      conflictMessages.push("Phone number already exists");
    }
    if (conflictMessages.length > 0) {
      throw new ConflictError("Request Conflict", {
        conflictError: conflictMessages,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInput = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    };

    const createdUser = await UserRepository.createUser(newUserInput);

    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(rawCode, 10);
    await AuthRepository.createVerificationCode(
      createdUser.id,
      hashedCode,
      VerificationType.EMAIL_VERIFICATION,
      10
    );

    const subject = getEmailSubject("Pbroker", "Email Verification Code");
    const html = emailVerificationTemplate(rawCode, createdUser.firstName);

    await sendEmail({ to: createdUser.email, subject, html });

    return {
      firstName,
      lastName,
      email
    };
  }
  static async signin(
    credentials: AuthSignInValidatedInput
  ): Promise<AuthSignInResponseData> {
    const { email, password } = credentials;
    const user = await UserRepository.findUserByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid credentials");
    }
    if (!user.emailVerified) {
      throw new UnverifiedEmailError("Please verify your email first.", {
        email: user.email,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      }
    );
    const responseData: AuthSignInResponseData = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role as Role,
      },
    };

    return responseData;
  }
  static async refreshToken(
    refreshToken: string
  ): Promise<AuthSignInResponseData> {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_TOKEN_SECRET!
      ) as jwt.JwtPayload;
    } catch (err) {
      throw new ForbiddenError("Invalid or expired refresh token");
    }

    const user = await UserRepository.findUserById(decoded.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userPayload: UserPayload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role as Role,
    };

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      }
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: userPayload,
    };
  }
  static async verifyUserEmailByOtpCode(email: string, code: string) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.emailVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const userId = user.id;

    const latestCodeRecord = await AuthRepository.findUserValidCodesByType(
      userId,
      VerificationType.EMAIL_VERIFICATION
    );

    if (!latestCodeRecord) {
      throw new AppError(
        "Verification code expired or not found",
        410,
        "VERIFICATION_CODE_EXPIRED"
      );
    }

    const isMatch = await bcrypt.compare(code, latestCodeRecord.code);

    if (!isMatch) {
      throw new AppError(
        "Invalid verification code",
        400,
        "INVALID_VERIFICATION_CODE"
      );
    }

    await UserRepository.verifyUserEmailById(userId);
    await AuthRepository.deleteVerificationCode(latestCodeRecord.id);

    return true;
  }
  static async resendUserEmailVerificationCode(
    email: string,
    type:'EMAIL_VERIFICATION'
  ) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.emailVerified) {
      throw new BadRequestError("Email is already verified");
    }

    await AuthRepository.deleteUserVerificationCodesByType(user.id, type);
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(rawCode, 10);
    await AuthRepository.createVerificationCode(user.id, hashedCode, type, 10);

    const subject = getEmailSubject("Pbroker", "Email Verification Code");
    const html = emailVerificationTemplate(rawCode, user.firstName);
    await sendEmail({ to: user.email, subject, html });
    return {
      email
    };
  }
  static async forgotPassword(email: string) {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (!user.emailVerified) {
      throw new UnverifiedEmailError("Please verify your email first.", {
        email: user.email,
      });
    }

  await AuthRepository.deleteUserVerificationCodesByType(user.id, VerificationType.FORGOT_PASSWORD);

  const rawToken = crypto.randomBytes(24).toString("hex"); 
  const hashedToken = await bcrypt.hash(rawToken, 10);

  await AuthRepository.createVerificationCode(
    user.id,
    hashedToken,
    VerificationType.FORGOT_PASSWORD,
    PASSWORD_RESET_EXPIRES_IN
  );

      const subject = getEmailSubject("Pbroker", "Password Reset Request");
     const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}&key=${user.id}`;
    const html = resetPasswordTemplate(resetLink, user.firstName);
    
    await sendEmail({ to: email, subject, html });
    return {
      email
    };
  }
  static async resetUserPassword(
    data: ResetPasswordValidatedInput
  ): Promise<ResetPasswordResponse> {
    const { key:userId, token, password } = data;

  const user = await UserRepository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found");

  const latestCodeRecord = await AuthRepository.findUserValidCodesByType(
    userId,
    VerificationType.FORGOT_PASSWORD
  );

  if (!latestCodeRecord) {
    throw new AppError(
      "Password reset token expired or not found",
      410,
      "PASSWORD_RESET_TOKEN_EXPIRED"
    );
  }

  const isMatch = await bcrypt.compare(token, latestCodeRecord.code);
  if (!isMatch) {
    throw new AppError(
      "Invalid password reset token",
      400,
      "INVALID_PASSWORD_RESET_TOKEN"
    );
  }


    const hashedPassword = await bcrypt.hash(password, 10);

    await UserRepository.updateUserPasswordByEmail(
      user.email,
      hashedPassword
    );
  await AuthRepository.deleteVerificationCode(latestCodeRecord.id);

    return { message: "Password reseted successfully" };
  }
}
