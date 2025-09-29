import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../error/index.error.js";

export const validate = (schemas: {
  params?: z.ZodSchema;
  query?: z.ZodSchema;
  body?: z.ZodSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
       schemas.query.parse(req.query);
       // query can't be set it is only getter
      }
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (error) {
      console.log(error, "error");
      next(
        new ValidationError("Validation failed", {
          validationError: formatZodError(error),
        })
      );
    }
  };
};

const formatZodError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  return [{ field: "unknown", message: "Unknown validation error" }];
};
