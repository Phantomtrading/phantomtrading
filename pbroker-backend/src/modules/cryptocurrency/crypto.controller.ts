import type { NextFunction, Request, Response } from "express";
import {
  APIResponder,
  type APIResponse,
} from "../../common/util/apiResponder.util.js";
import type {
  CryptocurrencyInput,
  CryptocurrencyUpdateValidatedInput,
} from "./crypto.validation.js";
import { CryptocurrencyService } from "./crypto.service.js";
import type { Cryptocurrency } from "../../generated/prisma/index.js";

export class CryptocurrencyController {
  static async addCrypto(
    req: Request<unknown, unknown, CryptocurrencyInput>,
    res: Response<APIResponse<Cryptocurrency>>,
    next: NextFunction
  ) {
    try {
      const { symbol, name, tokenStandard, depositAddress, coingeckoId } = req.body;
      const data = { symbol, name, coingeckoId, tokenStandard, depositAddress };
      const result = await CryptocurrencyService.addCrypto(data);
      APIResponder.created(
        res,
        result,
        "CRYPTO_ADDED",
        "Crypto added successfully"
      );
    } catch (error) {
      next(error);
    }
  }
  static async getAllCryptoCurrencies(
    _req: Request,
    res: Response<APIResponse<Cryptocurrency[]>>,
    next: NextFunction
  ) {
    try {
      const result = await CryptocurrencyService.getAllCryptoCurrencies();
      APIResponder.ok(res, result, "FETCHED", "Fetched sucessfully.");
    } catch (error) {
      next(error);
    }
  }
  static async getCryptoCurrencyById(
    req: Request,
    res: Response<APIResponse<Cryptocurrency[]>>,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const result = await CryptocurrencyService.getCryptoCurrencyById(id);
      APIResponder.ok(res, result, "FETCHED", "Fetched sucessfully.");
    } catch (error) {
      next(error);
    }
  }
  static async updateCryptoCurrencyById(
    req: Request,
    res: Response<APIResponse<Cryptocurrency[]>>,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const data = req.body as CryptocurrencyUpdateValidatedInput;
      const result = await CryptocurrencyService.updateCryptoCurrencyById(
        id,
        data
      );
      APIResponder.ok(res, result, "Updated", "Updated sucessfully.");
    } catch (error) {
      next(error);
    }
  }
  static async deleteCryptoCurrencyById(
    req: Request,
    res: Response<APIResponse<Cryptocurrency[]>>,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      await CryptocurrencyService.deleteCryptoCurrencyById(id);
      APIResponder.deleted(res);
    } catch (error) {
      next(error);
    }
  }
}
