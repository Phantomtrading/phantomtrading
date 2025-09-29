import type { NextFunction, Request, Response } from "express";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import {BadRequestError } from "../../common/error/index.error.js";
import { TradingPairService } from "./tradingPair.service.js";

export class TradingPairController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TradingPairService.create(req.body);
      APIResponder.created(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TradingPairService.getAll();
      APIResponder.ok(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new BadRequestError("Invalid ID", 400);
      const data = await TradingPairService.getById(id);
      APIResponder.ok(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new BadRequestError("Invalid ID", 400);
      const data = await TradingPairService.update(id, req.body);
      APIResponder.updated(res, data);
    } catch (error) {
      next(error);
    }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new BadRequestError("Invalid ID", 400);
       await TradingPairService.delete(id);
      APIResponder.deleted(res);
    } catch (error) {
      next(error);
    }
  }
}
