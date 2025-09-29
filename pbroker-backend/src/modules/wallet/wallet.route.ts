import { Router } from "express";
import { WalletController } from "./wallet.controller.js";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  walletTransferSchema,
  walletUpdateSchema,
} from "./wallet.validation.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";

const walletRouter = Router();

walletRouter.post(
  "/self-transfer",
  authenticate,
  validate({ body: walletTransferSchema }),
  WalletController.transfer
);
walletRouter.get("/balances", authenticate, WalletController.getBalances);
walletRouter.patch(
  "/:id/balance",
  authenticate,
  authorize(["ADMIN"]),
  validate({ body: walletUpdateSchema }),
  WalletController.updateWalletBalance
);

export default walletRouter;
