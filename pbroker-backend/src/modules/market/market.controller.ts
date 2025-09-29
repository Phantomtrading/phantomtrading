// src/controllers/market.controller.ts
import type { NextFunction, Request, Response } from "express";
import { MarketService } from "./market.service.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";

export class MarketController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;

      const { data, meta } = await MarketService.getPaginatedMarketData(
        page,
        limit
      );

      APIResponder.paginated(res, {
        code: "SUCCESS",
        message: "Market data fetched successfully",
        data,
        page,
        limit,
        total: meta.total,
      });
    } catch (error) {
      console.log(error)
      next(error);
    }
  }
  static async getById(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
    }

    try {
      const data = await MarketService.getMarketDataById(id);
      APIResponder.ok(
        res,
        data,
        "MARKET_DATA",
        "Market Data Fetched Successfully"
      );
    } catch (error: any) {
      console.log(error)
      next(error);
    }
  }
}
