-- CreateEnum
CREATE TYPE "DebtSourceType" AS ENUM ('HOUSEHOLD', 'PERSONAL');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "household_expenses" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "expense_date" DATE NOT NULL,
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_payers" (
    "id" UUID NOT NULL,
    "expense_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "paid_amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_payers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_participants" (
    "id" UUID NOT NULL,
    "expense_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "share_amount" DECIMAL(15,2) NOT NULL,
    "share_percentage" DECIMAL(7,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debts" (
    "id" UUID NOT NULL,
    "debtor_id" UUID NOT NULL,
    "creditor_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "source_type" "DebtSourceType" NOT NULL,
    "household_expense_id" UUID,
    "description" VARCHAR(255) NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'OPEN',
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_settlements" (
    "id" UUID NOT NULL,
    "debt_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "settled_at" DATE NOT NULL,
    "created_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "household_expenses_household_id_expense_date_idx" ON "household_expenses"("household_id", "expense_date");

-- CreateIndex
CREATE INDEX "household_expenses_household_id_created_at_idx" ON "household_expenses"("household_id", "created_at");

-- CreateIndex
CREATE INDEX "household_expenses_created_by_idx" ON "household_expenses"("created_by");

-- CreateIndex
CREATE INDEX "expense_payers_user_id_idx" ON "expense_payers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_payers_expense_id_user_id_key" ON "expense_payers"("expense_id", "user_id");

-- CreateIndex
CREATE INDEX "expense_participants_user_id_idx" ON "expense_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_participants_expense_id_user_id_key" ON "expense_participants"("expense_id", "user_id");

-- CreateIndex
CREATE INDEX "debts_debtor_id_status_idx" ON "debts"("debtor_id", "status");

-- CreateIndex
CREATE INDEX "debts_creditor_id_status_idx" ON "debts"("creditor_id", "status");

-- CreateIndex
CREATE INDEX "debts_household_expense_id_idx" ON "debts"("household_expense_id");

-- CreateIndex
CREATE INDEX "debts_source_type_status_idx" ON "debts"("source_type", "status");

-- CreateIndex
CREATE INDEX "debt_settlements_debt_id_settled_at_idx" ON "debt_settlements"("debt_id", "settled_at");

-- CreateIndex
CREATE INDEX "debt_settlements_created_by_idx" ON "debt_settlements"("created_by");

-- AddForeignKey
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_payers" ADD CONSTRAINT "expense_payers_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "household_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_payers" ADD CONSTRAINT "expense_payers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "household_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_creditor_id_fkey" FOREIGN KEY ("creditor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_household_expense_id_fkey" FOREIGN KEY ("household_expense_id") REFERENCES "household_expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
