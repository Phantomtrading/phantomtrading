import type { Request, Response, NextFunction } from "express";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import { TradeOptionService } from "./tradeOption.service.js";

export class TradeOptionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TradeOptionService.create(req.body);
      APIResponder.created(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async getByPairId(req: Request, res: Response, next: NextFunction) {
    try {
      const tradingPairId = Number(req.query.tradingPairId);
      const options = await TradeOptionService.getByPairId(tradingPairId);
      APIResponder.ok(res, options);
    } catch (error) {
      next(error);
    }
  }
    static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tradeOptionId = Number(req.params.id);
      const options = await TradeOptionService.getById(tradeOptionId);
      APIResponder.ok(res, options);
    } catch (error) {
      next(error);
    }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updated = await TradeOptionService.update(id, req.body);
      APIResponder.ok(res, updated);
    } catch (error) {
      next(error);
    }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await TradeOptionService.delete(id);
      APIResponder.deleted(res);
    } catch (error) {
      next(error);
    }
  }
}
