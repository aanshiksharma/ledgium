/*
  Warnings:

  - Added the required column `remaining_amount` to the `debts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "remaining_amount" DECIMAL(15,2) NOT NULL;

-- CreateIndex
CREATE INDEX "debts_debtor_id_creditor_id_is_active_idx" ON "debts"("debtor_id", "creditor_id", "is_active");

-- CreateIndex
CREATE INDEX "debts_household_expense_id_is_active_idx" ON "debts"("household_expense_id", "is_active");
