/*
  Warnings:

  - You are about to drop the column `dailyRate` on the `ArbitrageOrder` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `ArbitrageOrder` table. All the data in the column will be lost.
  - You are about to drop the column `dailyRate` on the `ArbitrageProduct` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `ArbitrageProduct` table. All the data in the column will be lost.
  - You are about to drop the column `maxAmount` on the `ArbitrageProduct` table. All the data in the column will be lost.
  - You are about to drop the column `minAmount` on the `ArbitrageProduct` table. All the data in the column will be lost.
  - Added the required column `dailyRoiRate` to the `ArbitrageOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationDays` to the `ArbitrageOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyRoiRate` to the `ArbitrageProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationDays` to the `ArbitrageProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxInvestment` to the `ArbitrageProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minInvestment` to the `ArbitrageProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ArbitrageOrder" DROP COLUMN "dailyRate",
DROP COLUMN "days",
ADD COLUMN     "dailyRoiRate" DECIMAL(7,5) NOT NULL,
ADD COLUMN     "durationDays" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ArbitrageProduct" DROP COLUMN "dailyRate",
DROP COLUMN "days",
DROP COLUMN "maxAmount",
DROP COLUMN "minAmount",
ADD COLUMN     "dailyRoiRate" DECIMAL(7,5) NOT NULL,
ADD COLUMN     "durationDays" INTEGER NOT NULL,
ADD COLUMN     "maxInvestment" DECIMAL(30,18) NOT NULL,
ADD COLUMN     "minInvestment" DECIMAL(30,18) NOT NULL;

-- CreateIndex
CREATE INDEX "ArbitrageOrder_userId_status_idx" ON "public"."ArbitrageOrder"("userId", "status");
