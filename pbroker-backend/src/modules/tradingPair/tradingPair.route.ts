import { Router } from "express";
import { TradingPairController } from "./tradingPair.controller.js";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

import { authorize } from "../../common/middleware/authorize.middleware.js";
import { createTradingPairSchema, updateTradingPairSchema } from "./tradingPair.validation.js";

export const tradingPairRouter = Router();

tradingPairRouter.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate({ body: createTradingPairSchema }),
  TradingPairController.create
);

tradingPairRouter.get(
  "/",
  authenticate,
  TradingPairController.getAll
);

tradingPairRouter.get(
  "/:id",
  authenticate,
  TradingPairController.getById
);

tradingPairRouter.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate({ body: updateTradingPairSchema }),
  TradingPairController.update
);

tradingPairRouter.delete(
  "/:id",
  authenticate,
  TradingPairController.delete
);

export default tradingPairRouter
