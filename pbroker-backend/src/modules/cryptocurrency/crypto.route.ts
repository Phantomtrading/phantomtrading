import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware.js";
import { CryptocurrencyController } from "./crypto.controller.js";
import {
  CryptocurrencyInputSchema,
  CryptoUpdateSchema,
} from "./crypto.validation.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { authenticate } from "../../common/middleware/authenticate.middleware.js";

const cryptoCurrencyRouter = Router();

cryptoCurrencyRouter.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  validate({ body: CryptocurrencyInputSchema }),
  authorize(["ADMIN"]),
  CryptocurrencyController.addCrypto
);
cryptoCurrencyRouter.get("/", CryptocurrencyController.getAllCryptoCurrencies);

cryptoCurrencyRouter.get(
  "/:id",
  CryptocurrencyController.getCryptoCurrencyById
);
cryptoCurrencyRouter.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate({ body: CryptoUpdateSchema }),
  CryptocurrencyController.updateCryptoCurrencyById
);
cryptoCurrencyRouter.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  CryptocurrencyController.deleteCryptoCurrencyById
);

export default cryptoCurrencyRouter;
