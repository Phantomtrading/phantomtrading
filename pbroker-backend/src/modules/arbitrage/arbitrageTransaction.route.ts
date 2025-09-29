import { Router } from "express";
import { ArbitrageTransactionController } from "./arbitrageTransaction.controller.js";

const arbitrageTransactionRouter = Router();

arbitrageTransactionRouter.get("/:id", ArbitrageTransactionController.getTransaction);
arbitrageTransactionRouter.get("/", ArbitrageTransactionController.getAllTransactions);
arbitrageTransactionRouter.get("/earned/total", ArbitrageTransactionController.getUserTotalEarned);

export default arbitrageTransactionRouter;
