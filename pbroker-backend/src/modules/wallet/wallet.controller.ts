import type { Request, Response, NextFunction } from "express";
import { WalletService } from "./wallet.service.js";
import { APIResponder } from "../../common/util/apiResponder.util.js";
import type { WalletTransferInput } from "./wallet.validation.js";

export class WalletController {
  static async getBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      const balances = await WalletService.getBalances(authUser.userId);
      APIResponder.ok(res, balances);
    } catch (err) {
      next(err);
    }
  }
  static async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user;
      const data = req.body as WalletTransferInput;
      const result = await WalletService.transfer(
        authUser.userId,
        data.from,
        data.to,
        data.amount
      );
      APIResponder.ok(res, result);
    } catch (err) {
      next(err);
    }
  }
  static async updateWalletBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const walletId = req.params.id;
      const { balance } = req.body;
      const updatedWallet = await WalletService.updateWalletBalance(walletId, balance);
      APIResponder.ok(res, updatedWallet);
    } catch (err) {
      next(err);
    }
  }
}

