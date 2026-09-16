-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK', 'CASH', 'CREDIT_CARD', 'INVESTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DebtSourceType" AS ENUM ('HOUSEHOLD', 'PERSONAL');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_members" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "AccountType" NOT NULL,
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "parent_id" UUID,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "category_id" UUID,
    "created_by" UUID NOT NULL,
    "transfer_id" UUID,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "transaction_date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_expenses" (
    "id" UUID NOT NULL,
    "household_id" UUID NOT NULL,
    "category_id" UUID,
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
    "remaining_amount" DECIMAL(15,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "source_type" "DebtSourceType" NOT NULL,
    "household_expense_id" UUID,
    "description" VARCHAR(255) NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'OPEN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_settlements" (
    "id" UUID NOT NULL,
    "debtor_id" UUID NOT NULL,
    "creditor_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "settled_at" DATE NOT NULL,
    "created_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_settlements_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "household_members_user_id_idx" ON "household_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "household_members_household_id_user_id_key" ON "household_members"("household_id", "user_id");

-- CreateIndex
CREATE INDEX "accounts_household_id_idx" ON "accounts"("household_id");

-- CreateIndex
CREATE INDEX "accounts_household_id_is_active_idx" ON "accounts"("household_id", "is_active");

-- CreateIndex
CREATE INDEX "categories_household_id_idx" ON "categories"("household_id");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_household_id_name_key" ON "categories"("household_id", "name");

-- CreateIndex
CREATE INDEX "transactions_household_id_transaction_date_idx" ON "transactions"("household_id", "transaction_date");

-- CreateIndex
CREATE INDEX "transactions_household_id_account_id_transaction_date_idx" ON "transactions"("household_id", "account_id", "transaction_date");

-- CreateIndex
CREATE INDEX "transactions_household_id_category_id_transaction_date_idx" ON "transactions"("household_id", "category_id", "transaction_date");

-- CreateIndex
CREATE INDEX "transactions_household_id_transfer_id_idx" ON "transactions"("household_id", "transfer_id");

-- CreateIndex
CREATE INDEX "household_expenses_household_id_expense_date_idx" ON "household_expenses"("household_id", "expense_date");

-- CreateIndex
CREATE INDEX "household_expenses_household_id_created_at_idx" ON "household_expenses"("household_id", "created_at");

-- CreateIndex
CREATE INDEX "household_expenses_household_id_category_id_idx" ON "household_expenses"("household_id", "category_id");

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
CREATE INDEX "debts_debtor_id_creditor_id_is_active_idx" ON "debts"("debtor_id", "creditor_id", "is_active");

-- CreateIndex
CREATE INDEX "debts_household_expense_id_is_active_idx" ON "debts"("household_expense_id", "is_active");

-- CreateIndex
CREATE INDEX "debts_household_expense_id_idx" ON "debts"("household_expense_id");

-- CreateIndex
CREATE INDEX "debts_source_type_status_idx" ON "debts"("source_type", "status");

-- CreateIndex
CREATE INDEX "debt_settlements_debtor_id_settled_at_idx" ON "debt_settlements"("debtor_id", "settled_at");

-- CreateIndex
CREATE INDEX "debt_settlements_creditor_id_settled_at_idx" ON "debt_settlements"("creditor_id", "settled_at");

-- CreateIndex
CREATE INDEX "debt_settlements_created_by_idx" ON "debt_settlements"("created_by");

-- CreateIndex
CREATE INDEX "debt_settlement_allocations_settlement_id_idx" ON "debt_settlement_allocations"("settlement_id");

-- CreateIndex
CREATE INDEX "debt_settlement_allocations_debt_id_idx" ON "debt_settlement_allocations"("debt_id");

-- CreateIndex
CREATE UNIQUE INDEX "debt_settlement_allocations_settlement_id_debt_id_key" ON "debt_settlement_allocations"("settlement_id", "debt_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_debtor_id_fkey" FOREIGN KEY ("debtor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_creditor_id_fkey" FOREIGN KEY ("creditor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlements" ADD CONSTRAINT "debt_settlements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlement_allocations" ADD CONSTRAINT "debt_settlement_allocations_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "debt_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_settlement_allocations" ADD CONSTRAINT "debt_settlement_allocations_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
