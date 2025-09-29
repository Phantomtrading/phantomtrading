/*
  Warnings:

  - Added the required column `description` to the `ArbitrageProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ArbitrageProduct" ADD COLUMN     "description" TEXT NOT NULL;
