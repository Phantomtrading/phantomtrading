import { Router } from "express";
import { MarketController } from "./market.controller.js";

const marketRouter = Router();

marketRouter.get("/", MarketController.getAll);
marketRouter.get("/:id", MarketController.getById);

export default marketRouter;