// middlewares/validateDepositFiles.ts
import type { Request, Response, NextFunction } from "express";
import { APIResponder } from "../util/apiResponder.util.js";
import { BadRequestError } from "../error/index.error.js";
export const validateDepositFilesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length < 1) {
    APIResponder.error(
      res,
      new BadRequestError("At least one proof file is required.")
    );
  }

  if (files.length > 3) {
    APIResponder.error(
      res,
      new BadRequestError("You can upload at most 3 files.")
    );
  }

  for (const file of files) {
    const isValid =
      file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";

    if (!isValid) {
      APIResponder.error(
        res,
        new BadRequestError("Only image or PDF files are allowed.")
      );

      return res
        .status(400)
        .json({ message: "Only image or PDF files are allowed." });
    }

    if (file.size > 5 * 1024 * 1024) {
      APIResponder.error(
        res,
        new BadRequestError("Each file must be less than 5MB.")
      );
    }
  }

  return next();
};
