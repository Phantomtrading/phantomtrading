import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  CreateWithdrawalSchema,
  UpdateWithdrawalStatusSchema,
} from "./withdrawal.validation.js";
import { WithdrawalController } from "./withdrawal.controller.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { withdrawalCreateLimiter } from "../../common/middleware/ratelimit.middleware.js";

const withdrawalRouter = Router();

withdrawalRouter.post(
  "/",
  withdrawalCreateLimiter,
  authenticate,
  validate({ body: CreateWithdrawalSchema }),
  WithdrawalController.create
);
withdrawalRouter.get(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  WithdrawalController.getAll
);
withdrawalRouter.get(
  "/user/:userId",
  authenticate,
  WithdrawalController.getUserWithdrawals
);
withdrawalRouter.get("/:id", authenticate, WithdrawalController.getById);
withdrawalRouter.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate({ body: UpdateWithdrawalStatusSchema }),
  WithdrawalController.updateStatus
);

export default withdrawalRouter;
