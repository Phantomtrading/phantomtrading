import { RequestUser } from "../../modules/auth/auth.type.ts";
declare global {
  namespace Express {
    interface Request {
      user?: VerifiedUser;
    }
  }
}