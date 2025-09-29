import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../error/index.error.js";
import type { Role } from "../../generated/prisma/index.js";


export function authorize(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      // Not authenticated, AuthMiddleware should catch this first though
      return next(new UnauthorizedError("Authentication required."));
    }
    if (!allowedRoles.includes(user.role as Role)) {
      return next(new ForbiddenError("You do not have permission to perform this action."));
    }

    next();
  };
}
