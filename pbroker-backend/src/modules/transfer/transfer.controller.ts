import type { NextFunction, Request, Response } from "express";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import { TransferService } from "./transfer.service.js";
import type {
  TransferQueryOption,
  ValidTransferInput,
} from "./transfer.validation.js";
import type { BaseQueryOption } from "../../types/zodschema/queryoption.schema.js";

export class TransferController {
  static async initiateTransfer(
    req: Request<unknown, unknown, ValidTransferInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const senderId = req.user.userId;
      const { amount, recipientIdentifier } = req.body;
      const data = { amount, recipientIdentifier };
      const result = await TransferService.initiateTransfer(senderId, data);
      APIResponder.created(res, result, "TRANSFERED", "Amount transfered successful");
    } catch (error) {
      next(error);
    }
  }
  static async findAllTransfers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const options = req.query as unknown as BaseQueryOption;
      const page =
        options.page && !isNaN(Number(options.page)) ? Number(options.page) : 1;
      const limit =
        options.limit && !isNaN(Number(options.limit))
          ? Number(options.limit)
          : 50;

      const query = { page, limit };

      const result = await TransferService.findAllTransfers(query);
      APIResponder.paginated(res, {
        data: result.transfers,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }
  static async findTransferById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;
      const transfer = await TransferService.findTransferById(id, req.user);
      APIResponder.ok(res, transfer);
    } catch (error) {
      next(error);
    }
  }
  static async findTransfersByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = parseInt(req.params.id);
      const options = req.query as unknown as TransferQueryOption;
      const page =
        options.page && !isNaN(Number(options.page)) ? Number(options.page) : 1;
      const limit =
        options.limit && !isNaN(Number(options.limit))
          ? Number(options.limit)
          : 50;
      const query = { ...options, page, limit };

      const result = await TransferService.findTransfersByUserId(
        userId,
        req.user,
        query
      );
      APIResponder.paginated(res, {
        data: result.transfers,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }
}
