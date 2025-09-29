-- CreateEnum
CREATE TYPE "public"."WalletType" AS ENUM ('TRADING', 'ARBITRAGE');

-- CreateEnum
CREATE TYPE "public"."ArbitrageOrderStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ArbitrageTransactionType" AS ENUM ('INTEREST', 'PRINCIPAL_RETURN');

-- CreateEnum
CREATE TYPE "public"."ArbitrageTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "public"."WalletType" NOT NULL,
    "balance" DECIMAL(30,18) NOT NULL DEFAULT 0,
    "locked" DECIMAL(30,18) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArbitrageProduct" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dailyRate" DECIMAL(7,5) NOT NULL,
    "minAmount" DECIMAL(30,18) NOT NULL,
    "maxAmount" DECIMAL(30,18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArbitrageProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArbitrageOrder" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DECIMAL(30,18) NOT NULL,
    "dailyRate" DECIMAL(7,5) NOT NULL,
    "days" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."ArbitrageOrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "earnedInterest" DECIMAL(30,18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArbitrageOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArbitrageTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(30,18) NOT NULL,
    "type" "public"."ArbitrageTransactionType" NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."ArbitrageTransactionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArbitrageTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "public"."Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_type_key" ON "public"."Wallet"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ArbitrageProduct_code_key" ON "public"."ArbitrageProduct"("code");

-- CreateIndex
CREATE INDEX "ArbitrageOrder_userId_idx" ON "public"."ArbitrageOrder"("userId");

-- CreateIndex
CREATE INDEX "ArbitrageOrder_productId_idx" ON "public"."ArbitrageOrder"("productId");

-- CreateIndex
CREATE INDEX "ArbitrageTransaction_orderId_idx" ON "public"."ArbitrageTransaction"("orderId");

-- CreateIndex
CREATE INDEX "ArbitrageTransaction_userId_idx" ON "public"."ArbitrageTransaction"("userId");

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArbitrageOrder" ADD CONSTRAINT "ArbitrageOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArbitrageOrder" ADD CONSTRAINT "ArbitrageOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."ArbitrageProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArbitrageTransaction" ADD CONSTRAINT "ArbitrageTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."ArbitrageOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArbitrageTransaction" ADD CONSTRAINT "ArbitrageTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
