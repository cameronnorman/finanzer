-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "day" DROP NOT NULL,
ALTER COLUMN "day" SET DEFAULT 1;