import { Router } from "express";
import { ArbitrageOrderController } from "./arbitrageOrder.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  arbitrageOrderAdminQuerySchema,
  arbitrageOrderQuerySchema,
  createArbitrageOrderSchema,
} from "./arbitrageOrder.validation.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";

const arbitrageOrderRouter = Router();

arbitrageOrderRouter.post("/", validate({ body: createArbitrageOrderSchema }), ArbitrageOrderController.create);
arbitrageOrderRouter.get("/", authorize(["ADMIN"]),  validate({ query: arbitrageOrderAdminQuerySchema }),
  ArbitrageOrderController.getAll
);
arbitrageOrderRouter.patch(
  "/:orderId/cancel",
  ArbitrageOrderController.cancel
);
arbitrageOrderRouter.get(
  "/user",
  validate({ query: arbitrageOrderQuerySchema }),
  ArbitrageOrderController.getUserOrders
);
arbitrageOrderRouter.get(
  "/:id",
  ArbitrageOrderController.getById
);

export default arbitrageOrderRouter;
