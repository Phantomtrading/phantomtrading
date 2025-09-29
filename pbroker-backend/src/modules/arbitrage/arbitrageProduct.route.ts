import { Router } from "express";
import { ArbitrageProductController } from "./arbitrageProduct.controller.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  arbitrageProductSchema,
  arbitrageProductUpdateSchema,
  arbitrageProductQuerySchema,
} from "./arbitrageProduct.validation.js";

const arbitrageProductRouter = Router();

arbitrageProductRouter.post(
  "/",
  authorize(["ADMIN"]),
  validate({ body: arbitrageProductSchema }),
  ArbitrageProductController.create
);
arbitrageProductRouter.get(
  "/",
  validate({ query: arbitrageProductQuerySchema }),
  ArbitrageProductController.getAll
);
arbitrageProductRouter.get(
  "/:id",
  ArbitrageProductController.getById
);
arbitrageProductRouter.patch(
  "/:id",
  authorize(["ADMIN"]),
  validate({ body: arbitrageProductUpdateSchema }),
  ArbitrageProductController.update
);
arbitrageProductRouter.delete(
  "/:id",
  authorize(["ADMIN"]),
  ArbitrageProductController.delete
);

export default arbitrageProductRouter;
