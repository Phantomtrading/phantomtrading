/*
  Warnings:

  - You are about to alter the column `amount` on the `Deposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(30,18)`.
  - You are about to alter the column `profitPercentage` on the `TradeOption` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,5)`.
  - You are about to alter the column `minAmountQuote` on the `TradeOption` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(30,18)`.
  - You are about to alter the column `maxAmountQuote` on the `TradeOption` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(30,18)`.
  - You are about to alter the column `tradingAmountQuote` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(30,18)`.
  - You are about to alter the column `tradingAmountBase` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(30,18)`.
  - You are about to alter the column `executionPrice` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(30,18)`.
  - You are about to alter the column `potentialProfitPercentage` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(7,5)`.
  - You are about to alter the column `expectedProfitQuote` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(30,18)`.
  - You are about to alter the column `transactionFeePercentage` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(7,5)`.
  - You are about to alter the column `transactionFeeAmountQuote` on the `TradeRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(30,18)`.
  - You are about to alter the column `defaultTransactionFeePercentage` on the `TradingPair` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(7,5)`.
  - You are about to alter the column `amount` on the `Transfer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,3)` to `Decimal(30,18)`.
  - You are about to alter the column `balance` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,3)` to `Decimal(30,18)`.
  - You are about to alter the column `amount` on the `Withdrawal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,3)` to `Decimal(30,18)`.
  - You are about to alter the column `fee` on the `Withdrawal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,3)` to `Decimal(7,5)`.

*/
-- AlterTable
ALTER TABLE "public"."Deposit" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(30,18);

-- AlterTable
ALTER TABLE "public"."TradeOption" ALTER COLUMN "profitPercentage" SET DATA TYPE DECIMAL(7,5),
ALTER COLUMN "minAmountQuote" SET DATA TYPE DECIMAL(30,18),
ALTER COLUMN "maxAmountQuote" SET DATA TYPE DECIMAL(30,18);

-- AlterTable
ALTER TABLE "public"."TradeRequest" ALTER COLUMN "tradingAmountQuote" SET DATA TYPE DECIMAL(30,18),
ALTER COLUMN "tradingAmountBase" SET DATA TYPE DECIMAL(30,18),
ALTER COLUMN "executionPrice" SET DATA TYPE DECIMAL(30,18),
ALTER COLUMN "potentialProfitPercentage" SET DATA TYPE DECIMAL(7,5),
ALTER COLUMN "expectedProfitQuote" SET DATA TYPE DECIMAL(30,18),
ALTER COLUMN "transactionFeePercentage" SET DATA TYPE DECIMAL(7,5),
ALTER COLUMN "transactionFeeAmountQuote" SET DATA TYPE DECIMAL(30,18);

-- AlterTable
ALTER TABLE "public"."TradingPair" ALTER COLUMN "defaultTransactionFeePercentage" SET DATA TYPE DECIMAL(7,5);

-- AlterTable
ALTER TABLE "public"."Transfer" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(30,18);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(30,18);

-- AlterTable
ALTER TABLE "public"."Withdrawal" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(30,18),
ALTER COLUMN "fee" SET DATA TYPE DECIMAL(7,5);
