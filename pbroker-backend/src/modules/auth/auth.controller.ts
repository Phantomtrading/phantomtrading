import type { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import type {
  AuthSignInValidatedInput,
  AuthSignUpValidatedInput,
  EmailVerificationValidatedInput,
  ResetPasswordValidatedInput,
} from "./auth.validation.js";
import {
  APIResponder,
  type APIResponse,
} from "../../common/util/apiResponder.util.js";
import type {
  AuthSignInResponseData,
  AuthSignUpResponse,
  ResetPasswordResponse,
} from "./auth.type.js";
import { UnauthorizedError } from "../../common/error/index.error.js";

// Shared cookie options for refresh token
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

export class AuthController {
  static async signup(
    req: Request<object, object, AuthSignUpValidatedInput>,
    res: Response<APIResponse<AuthSignUpResponse>>,
    next: NextFunction
  ) {
    try {
      const data = req.body;
      const result = await AuthService.signup(data);
      APIResponder.created(
        res,
        result,
        "USER_CREATED",
        "User account created successfully. Please check your email to verify your account."
      );
    } catch (error) {
      next(error);
    }
  }
  static async signin(
    req: Request<unknown, unknown, AuthSignInValidatedInput>,
    res: Response<APIResponse<AuthSignInResponseData>>,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.signin({ email, password });
      const { refreshToken, ...withOutRefreshToken } = result;
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
      APIResponder.ok(
        res,
        withOutRefreshToken,
        "SIGNEDIN",
        "User signed in successfully"
      );
    } catch (error) {
      next(error);
    }
  }
  static async refreshToken(
    req: Request,
    res: Response<APIResponse<AuthSignInResponseData>>,
    next: NextFunction
  ) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new UnauthorizedError("Refresh token is missing"));
      }

      const result = await AuthService.refreshToken(refreshToken);
      const { refreshToken: newrefreshtoken, ...withOutRefreshToken } = result;

      res.cookie("refreshToken", newrefreshtoken, refreshTokenCookieOptions);
      APIResponder.ok(
        res,
        withOutRefreshToken,
        "ACCESS_TOKEN_REFRESHED",
        "Access token refreshed successfully"
      );
    } catch (error) {
      // clearing cookie might be needed here
      next(error);
    }
  }
  static async resetUserPassword(
    req: Request<never, never, ResetPasswordValidatedInput>,
    res: Response<APIResponse<ResetPasswordResponse>>,
    next: NextFunction
  ) {
    try {
      const { key, token, password } = req.body;
      const result = await AuthService.resetUserPassword({ key, token, password });
      APIResponder.success(
        res,
        {
        code:"PASSWORD_RESET",
        message:result.message
      }
      );
    } catch (error) {
      next(error);
    }
  }
  static async verifyEmail(req: Request<never, never, EmailVerificationValidatedInput>, res: Response, next:NextFunction) {
    try {
      const { email, code } = req.body;
      await AuthService.verifyUserEmailByOtpCode(email, code);
      APIResponder.success(res, {
        code: "EMAIL_VERIFIED",
        message: "Email verified successfully.",
      });
    } catch (error: any) {
      next(error)
    }
  }
  static async resendUserEmailVerification(req: Request, res: Response, next:NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendUserEmailVerificationCode(
        email,
        "EMAIL_VERIFICATION"
      );
      APIResponder.success(res, {
        code: "OTP_CODE_SENT",
        message: "Verification code sent. Please check your email.",
        data: result
      });
    } catch (err: any) {
      next(err)
    }
  }
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      APIResponder.success(res, { code: "TOKEN_SENT", message: "reset password token sent. check your email.", data:{
        ...result 
      } });
    } catch (error) {
      next(error);
    }
  }
}
