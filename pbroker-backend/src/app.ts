
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import setupSwagger from "./swagger.js";
import { notFoundHandler } from "./common/middleware/notFound.middleware.js";
import { globalErrorHandler } from "./common/middleware/error.middleware.js";
import { APIResponder } from "./common/util/apiResponder.util.js";
import type { Request, Response } from "express";

import { corsOptions } from "./common/config/cors.js";

import cryptoRouter from "./modules/cryptocurrency/crypto.route.js";
import authRouter from "./modules/auth/auth.route.js";
import marketRouter from "./modules/market/market.route.js";
import depositRouter from "./modules/deposit/deposit.route.js";
import withdrawalRouter from "./modules/withdrawal/withdrawal.route.js";
import userRouter from "./modules/user/user.route.js";
import transferRouter from "./modules/transfer/transfer.route.js";
import tradingPairRouter from "./modules/tradingPair/tradingPair.route.js";
import tradeOptionRouter from "./modules/tradeOptions/tradeOption.route.js";
import tradeRouter from "./modules/trade/tradeRequest.route.js";
import arbitrageRouter from "./modules/arbitrage/arbitrage.route.js";
import walletRouter from "./modules/wallet/wallet.route.js";
import settingRouter from "./modules/setting/setting.route.js";
const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());


app.use("/api/health", async (_req: Request, res: Response) => {
  APIResponder.ok(
    res,
    { timestamp: new Date().toISOString() },
    "HEALTHY",
    "server is live"
  );
});

app.use('/api/auth', authRouter);
app.use('/api/cryptocurrencies', cryptoRouter)
app.use("/api/market-data", marketRouter);
app.use("/api/deposits", depositRouter)
app.use("/api/withdrawals", withdrawalRouter);
app.use("/api/users", userRouter);
app.use("/api/transfers", transferRouter);
app.use("/api/trading-pair-settings", tradingPairRouter);
app.use("/api/trade-options", tradeOptionRouter);
app.use("/api/trades", tradeRouter);
app.use("/api/arbitrage", arbitrageRouter);
app.use("/api/wallets", walletRouter);
app.use("/api/settings", settingRouter);

setupSwagger(app);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
