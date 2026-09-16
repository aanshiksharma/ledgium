-- AlterTable
ALTER TABLE "household_expenses" ADD COLUMN     "category_id" UUID;

-- CreateIndex
CREATE INDEX "household_expenses_household_id_category_id_idx" ON "household_expenses"("household_id", "category_id");

-- AddForeignKey
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
