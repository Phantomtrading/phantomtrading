import type { Request, Response, NextFunction } from "express";
import { NotFoundError, UnauthorizedError } from "../error/index.error.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET } from "../config/envVariables.js";
import { UserRepository } from "../../modules/user/user.repository.js";

/** Extract Bearer token from Authorization header */
function extractToken(req: Request): string | null {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  return type === "Bearer" && token ? token : null;
}

/** Authentication middleware verifying JWT and loading user info */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(new UnauthorizedError("Authentication token missing"));
    }

    // Verify JWT and cast payload type
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as JwtPayload & { userId: number; role: string };

    // Fetch user from DB by ID from token payload
    const user = await UserRepository.findUserById(decoded.userId);
    if (!user) {
      return next(new NotFoundError("User not found for the provided token"));
    }

    // Attach minimal verified user info to request
    req.user = { userId: decoded.userId, role: decoded.role };

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Token expired, please login again."));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError("Invalid token signature."));
    } else {
      return next(error);
    }
  }
};
