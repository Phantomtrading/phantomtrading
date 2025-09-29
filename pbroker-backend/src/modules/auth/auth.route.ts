import { Router } from 'express';import { AuthController } from './auth.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { AuthSignInSchema, AuthSignUpSchema, EmailSchema, EmailVerificationSchema, ForgotPasswordSchema, ResetPasswordSchema } from './auth.validation.js';
import { forgotPasswordLimiter, resendVerificationLimiter, resetPasswordLimiter, signinLimiter, signupLimiter, verifyEmailLimiter } from '../../common/middleware/ratelimit.middleware.js';

const authRouter = Router();

authRouter.post('/signup', signupLimiter, validate({body:AuthSignUpSchema}), AuthController.signup);
authRouter.post('/signin', signinLimiter, validate({body:AuthSignInSchema}), AuthController.signin);
authRouter.post('/forgot-password', forgotPasswordLimiter, validate({body:ForgotPasswordSchema}), AuthController.forgotPassword);
authRouter.patch('/reset-password', resetPasswordLimiter, validate({body:ResetPasswordSchema}),AuthController.resetUserPassword);
authRouter.post('/refresh-token',AuthController.refreshToken);
authRouter.post("/verify-email", verifyEmailLimiter, validate({body:EmailVerificationSchema}),AuthController.verifyEmail);
authRouter.post("/resend-email-verification", resendVerificationLimiter, validate({body:EmailSchema}), AuthController.resendUserEmailVerification);

export default authRouter;