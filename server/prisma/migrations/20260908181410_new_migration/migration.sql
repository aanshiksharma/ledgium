/*
  Warnings:

  - You are about to drop the column `type` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[household_id,name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories_household_id_name_type_key";

-- DropIndex
DROP INDEX "categories_household_id_type_idx";

-- DropIndex
DROP INDEX "transactions_household_id_type_transaction_date_idx";

-- DropIndex
DROP INDEX "transactions_transfer_id_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CategoryType";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateIndex
CREATE INDEX "categories_household_id_idx" ON "categories"("household_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_household_id_name_key" ON "categories"("household_id", "name");

-- CreateIndex
CREATE INDEX "transactions_household_id_transfer_id_idx" ON "transactions"("household_id", "transfer_id");
