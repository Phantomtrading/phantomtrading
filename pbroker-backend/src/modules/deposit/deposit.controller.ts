import type { Request, Response, NextFunction } from "express";
import { DepositService } from "./deposit.service.js";
import type {
  DepositValidatedInput,
} from "./deposit.validation.js";
import { BadRequestError} from "../../common/error/index.error.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";

export class DepositController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: DepositValidatedInput = req.body;
      const userId = req.user.userId;
      const files = req.files as Express.Multer.File[];
      const deposit = await DepositService.create(userId, data, files);

      APIResponder.created(res, deposit);
    } catch (error) {
      next(error);
    }
  }
  static async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const deposits = await DepositService.findAll();
      APIResponder.ok(res, deposits);
    } catch (error) {
      next(error);
    }
  }
  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const authenticatedUser = req.user;
      const deposit = await DepositService.findById(id, authenticatedUser);
      APIResponder.ok(res, deposit);
    } catch (error) {
      next(error);
    }
  }
  static async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const authenticatedUser = req.user;
      if (isNaN(userId)) {
        throw new BadRequestError("Invalid userId");
      }
      const deposits = await DepositService.findByUser(
        userId,
        authenticatedUser
      );
      APIResponder.ok(res, deposits);
    } catch (error) {
      next(error);
    }
  }
  static async totalAmountByUser(req: Request, res: Response,next: NextFunction) {
    try {
      const userId = Number(req.params.userId ?? req.query.userId);
      const authenticatedUser = req.user;
      if (isNaN(userId)) {
        throw new BadRequestError("Invalid userId");
      }
      const totalAmount = await DepositService.totalAmountByUser(
        userId,
        authenticatedUser
      );
      APIResponder.ok(res, { totalAmount });
    } catch (error) {
      next(error);
    }
  }
  static async countAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const totalCount = await DepositService.countAll();
      APIResponder.ok(res, { totalCount });
    } catch (error) {
      next(error);
    }
  }
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const { status, adminNotes } = req.body;
      const data = {
        status, adminNotes
      }
      const updatedDeposit = await DepositService.updateStatus(id, data);
      APIResponder.updated(res, updatedDeposit);
    } catch (error) {
      next(error);
    }
  }
  static async getProofs(req: Request, res: Response, next: NextFunction) {
    try {
      const depositId = req.params.id;
      const proofs = await DepositService.getProofsByDepositId(depositId);

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const withUrls = proofs.map((p) => ({
        id: p.id,
        filename: p.filename,
        url: `${baseUrl}/api/deposits/${depositId}/proofs/${encodeURIComponent(p.filename)}`,
      }));

      APIResponder.ok(res, withUrls);
    } catch (err) {
      next(err);
    }
  }
  static async downloadProof(req: Request, res: Response, next: NextFunction) {
    try {
      const filePath = await DepositService.downloadProof(
        req.params.id,
        req.params.fileName,
        req.user
      );
      return res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }
  static async deleteProof(req: Request, res: Response, next: NextFunction) {
    try {
      await DepositService.deleteProof(req.params.id, req.params.fileName, req.user);
      APIResponder.deleted(res);
    } catch (err) {
      next(err);
    }
  }
  static async addProofs(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files?.length) throw new BadRequestError("No files uploaded");
      const saved = await DepositService.addProofs(req.params.id, files, req.user);
     APIResponder.created(res, saved);
    } catch (err) {
      next(err);
    }
  }
}
