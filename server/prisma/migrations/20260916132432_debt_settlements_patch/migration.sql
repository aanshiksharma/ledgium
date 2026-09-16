/*
  Warnings:

  - You are about to drop the column `debt_id` on the `debt_settlements` table. All the data in the column will be lost.
  - Added the required column `creditor_id` to the `debt_settlements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debtor_id` to the `debt_settlements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "debt_settlements" DROP CONSTRAINT "debt_settlements_debt_id_fkey";

-- DropIndex
DROP INDEX "debt_settlements_debt_id_settled_at_idx";

-- AlterTable
ALTER TABLE "debt_settlements" DROP COLUMN "debt_id",
ADD COLUMN     "creditor_id" UUID NOT NULL,
ADD COLUMN     "debtor_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "debt_settlement_allocations" (
    "id" UUID NOT NULL,
    "settlement_id" UUID NOT NULL,
    "debt_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_settlement_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "debt_settlement_allocations_settlement_id_idx" ON "debt_settlement_allocations"("settlement_id");

-- CreateIndex
CREATE INDEX "debt_settlement_allocations_debt_id_idx" ON "debt_settlement_allocations"("debt_id");

-- CreateIndex
CREATE UNIQUE INDEX "debt_settlement_allocations_settlement_id_debt_id_key" ON "debt_settlement_allocations"("settlement_id", "debt_id");

-- CreateIndex
CREATE INDEX "debt_settlements_debtor_id_settled_at_idx" ON "debt_settlements"("debtor_id", "settled_at");

-- CreateIndex
CREATE INDEX "debt_settlements_creditor_id_settled_at_idx" ON "debt_settlements"("creditor_id", "settled_at");

-- AddForeignKey
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_creditor_id_fkey" FOREIGN KEY ("creditor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlement_allocations" ADD CONSTRAINT "debt_settlement_allocations_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "debt_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlement_allocations" ADD CONSTRAINT "debt_settlement_allocations_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
