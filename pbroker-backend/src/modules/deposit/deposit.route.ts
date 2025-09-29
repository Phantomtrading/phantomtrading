import { Router } from "express";
import { DepositController } from "./deposit.controller.js";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  depositSchema,
  depositUpdateStatusSchema,
} from "./deposit.validation.js";
import { uploadDepositProofs } from "../../common/middleware/multer.middleware.js";

const depositRouter = Router();

depositRouter.patch(  "/:id/status",  authenticate,  authorize(["ADMIN"]),  validate({ body: depositUpdateStatusSchema }),  DepositController.updateStatus);
depositRouter.delete("/:id/proofs/:fileName", authenticate, DepositController.deleteProof);
depositRouter.post("/:id/proofs", authenticate, uploadDepositProofs, DepositController.addProofs);
depositRouter.post(  "/",  authenticate,  uploadDepositProofs,   validate({ body: depositSchema }),  DepositController.create);

depositRouter.get("/count",authenticate,  authorize(["ADMIN"]),  DepositController.countAll);
depositRouter.get("/user/:userId/total-amount", authenticate,  DepositController.totalAmountByUser);
depositRouter.get("/user/:userId", authenticate, DepositController.findByUser);
depositRouter.get("/:id/proofs/:fileName", authenticate, DepositController.downloadProof);
depositRouter.get("/:id/proofs", authenticate, DepositController.getProofs);
depositRouter.get("/:id", authenticate, DepositController.findById);
depositRouter.get("/",authenticate,authorize(["ADMIN"]), DepositController.findAll);





export default depositRouter;
