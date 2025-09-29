import type { Request, Response, NextFunction } from "express";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import { BadRequestError } from "../../common/error/index.error.js";
import { TradeRequestService } from "./tradeRequest.service.js";

export class TradeRequestController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedUser = req.user;
      const data = await TradeRequestService.create(
        req.body,
        authenticatedUser
      );
      APIResponder.created(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TradeRequestService.getAll();
      APIResponder.ok(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const requestedUserId = parseInt(req.params.userId);
      const authenticatedUser = req.user;
      if (isNaN(requestedUserId)) throw new BadRequestError("Invalid user ID");

      const data = await TradeRequestService.getByUserId(
        requestedUserId,
        authenticatedUser
      );
      APIResponder.ok(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const authenticatedUser = req.user;
      const data = await TradeRequestService.getById(id, authenticatedUser);
      APIResponder.ok(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const updateData = req.body
      const user = req.user; 
      const updatedTrade = await TradeRequestService.update(id, user, updateData);
      APIResponder.updated(res, updatedTrade);
    } catch (error) {
      next(error);
    }
  }
}
