/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "recurring" DROP NOT NULL,
ALTER COLUMN "recurring" SET DEFAULT false,
ALTER COLUMN "recurringType" DROP NOT NULL,
ALTER COLUMN "recurringType" SET DEFAULT E'monthly',
ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "currency" SET DEFAULT E'EUR';

-- CreateIndex
CREATE UNIQUE INDEX "uniqCategoryByName" ON "Category"("name");
