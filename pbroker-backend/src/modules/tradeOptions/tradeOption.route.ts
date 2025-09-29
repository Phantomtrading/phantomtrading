// src/routes/tradeOption.route.ts
import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { CreateTradeOptionSchema, UpdateTradeOptionSchema } from "./tradeOption.validation.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { TradeOptionController } from "./tradeOption.controller.js";

const tradeOptionRouter = Router();

tradeOptionRouter.post(  "/",  authenticate,  authorize(["ADMIN"]),  validate({ body: CreateTradeOptionSchema }),  TradeOptionController.create);
tradeOptionRouter.get(  "/",  authenticate,  authorize(["ADMIN"]),  TradeOptionController.getByPairId);
tradeOptionRouter.get(  "/:id",  authenticate,  authorize(["ADMIN"]),  TradeOptionController.getById);

tradeOptionRouter.patch(  "/:id",  authenticate,  authorize(["ADMIN"]),  validate({ body: UpdateTradeOptionSchema }),  TradeOptionController.update);
tradeOptionRouter.delete(  "/:id",  authenticate,  authorize(["ADMIN"]),  TradeOptionController.delete);

export default tradeOptionRouter;
