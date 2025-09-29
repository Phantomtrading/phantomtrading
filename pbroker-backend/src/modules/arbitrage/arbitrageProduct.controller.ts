import type { Request, Response, NextFunction } from "express";
import { ArbitrageProductService } from "./arbitrageProduct.service.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import type {
  ArbitrageProductInput,
  ArbitrageProductUpdateInput,
  ArbitrageProductQuery,
} from "./arbitrageProduct.validation.js";

export class ArbitrageProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: ArbitrageProductInput = req.body;
      const product = await ArbitrageProductService.create(data);
      APIResponder.created(res, product);
    } catch (err) {
      next(err);
    }
  }
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query: ArbitrageProductQuery = req.query as any;
      const { data, total } = await ArbitrageProductService.getAll(
        query.page,
        query.limit,
        query.isActive
      );
      APIResponder.paginated(res, {
        data,
        total,
        page: query.page,
        limit: query.limit,
      });
    } catch (err) {
      next(err);
    }
  }
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ArbitrageProductService.getById(req.params.id);
      APIResponder.ok(res, product);
    } catch (err) {
      next(err);
    }
  }
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data: ArbitrageProductUpdateInput = req.body;
      const product = await ArbitrageProductService.update(req.params.id, data);
      APIResponder.updated(res, product);
    } catch (err) {
      next(err);
    }
  }
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ArbitrageProductService.delete(req.params.id);
      APIResponder.deleted(res);
    } catch (err) {
      next(err);
    }
  }
}
