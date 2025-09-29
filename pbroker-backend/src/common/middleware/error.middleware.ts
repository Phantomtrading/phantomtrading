import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/index.error.js";
import { APIResponder } from "../util/apiResponder.util.js";
import { logger } from "../util/logger.util.js";
import multer from "multer";
import { 
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError} from "../../generated/prisma/runtime/library.js";

  export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred. Please try again later.";
  let details: Record<string, any> = {};

  const isDev = process.env.NODE_ENV === "DEVELOPMENT";

    console.log(err, "error info")


  if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      code = "LIMIT_FILE_SIZE";
      message = "File too large. Maximum size allowed is 5MB.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      code = "LIMIT_FILE_COUNT";
      message = "Too many files uploaded. Maximum allowed is 3.";
    } else {
      code = err.code;
      message = `Upload error: ${err.message}`;
    }
  }

  // Handle malformed JSON (body parser errors)
  const isJsonParseError =
    err instanceof SyntaxError && (err as any).status === 400 && "body" in err;

  if (isJsonParseError) {
    statusCode = 400;
    code = "BAD_REQUEST";
    message = "Invalid JSON in request body.";
    details = { parsingError: err.message };
  }

  if (err instanceof PrismaClientInitializationError) {
    statusCode = 503;
    code = "DATABASE_UNAVAILABLE";
    message = isDev
      ? err.message
      : "Cannot connect to the database. Please try again later.";
    details = isDev ? { stack: err.stack, reason: err.message } : {};
  }

  else if (
    err instanceof PrismaClientRustPanicError ||
    err instanceof PrismaClientUnknownRequestError
  ) {
    statusCode = 500;
    code = "DATABASE_CRASHED";
    message = isDev
      ? err.message
      : "Unexpected database failure occurred.";
    details = isDev ? { error: err.message } : {};
  }

  // Distinguish unexpected errors vs operational errors
  const isKnownAppError = err instanceof AppError && err.isOperational;

  if (!isKnownAppError) {
    // Log unexpected errors with stack trace
    logger.error("🔥 Unhandled Error", {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      body: req.body,
      params: req.params,
      query: req.query,
      statusCode,
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    });

    err = new AppError(message, statusCode, code, details);
  } else {
    // Log expected (operational) errors as warnings
    logger.warn("⚠️ Operational Error", {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    });
  }

  APIResponder.error(res, err);
};
