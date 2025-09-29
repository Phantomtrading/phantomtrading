import { Router } from "express";
import { TransferController } from "./transfer.controller.js";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  transferQueryOptionSchema,
  transferSchema,
} from "./transfer.validation.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { baseQueryOptionSchema } from "../../types/zodschema/queryoption.schema.js";
import { transferCreateLimiter } from "../../common/middleware/ratelimit.middleware.js";

const transferRouter = Router();

// Authenticated route to initiate a transfer
transferRouter.post(
  "/",
  transferCreateLimiter,
  authenticate,
  validate({ body: transferSchema }),
  TransferController.initiateTransfer
);

// Public route to get all transfers with pagination
transferRouter.get(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate({ query: baseQueryOptionSchema }),
  TransferController.findAllTransfers
);

// Get a specific transfer by ID
transferRouter.get("/:id", authenticate, TransferController.findTransferById);

// Get transfers by a specific user ID with type and pagination
transferRouter.get(
  "/user/:id",
  authenticate,
  validate({ query: transferQueryOptionSchema }),
  TransferController.findTransfersByUserId
);

export default transferRouter;
