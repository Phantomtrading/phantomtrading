import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { TradeRequestController } from "./tradeRequest.controller.js";
import { createTradeRequestSchema, updateTradeRequestSchema } from "./tradeRequest.validation.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";

const tradeRouter = Router();

// POST /api/trades - Create a new trade request
tradeRouter.post("/", authenticate,  validate({ body: createTradeRequestSchema }), TradeRequestController.create
);
// GET /api/trades - Get all trade requests (admin only)
tradeRouter.get("/", authenticate, authorize(["ADMIN"]), TradeRequestController.getAll);

// GET /api/trades/user/:userId - Get trades by user ID
tradeRouter.get("/user/:userId", authenticate, TradeRequestController.getByUserId);

// GET /api/trades/:id - Get trade by ID
tradeRouter.get("/:id", authenticate, TradeRequestController.getById);

// patch /api/trades/:id - patch trade by ID
tradeRouter.patch("/:id", authenticate, validate({body:updateTradeRequestSchema}), TradeRequestController.updateById);

export default tradeRouter;
