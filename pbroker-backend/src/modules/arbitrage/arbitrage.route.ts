import { Router } from "express";
import arbitrageProductRouter from "./arbitrageProduct.route.js";
import arbitrageOrderRouter from "./arbitrageOrder.route.js";
import arbitrageTransactionRouter from "./arbitrageTransaction.route.js";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";

const arbitrageRouter = Router();
arbitrageRouter.use(authenticate);
arbitrageRouter.use("/products", arbitrageProductRouter);
arbitrageRouter.use("/orders", arbitrageOrderRouter);
arbitrageRouter.use("/transactions", arbitrageTransactionRouter)
export default arbitrageRouter;
