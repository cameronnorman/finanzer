/*
  Warnings:

  - A unique constraint covering the columns `[name,profileId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "uniqCategoryByName";

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uniqCategoryByNameAndProfileId" ON "Category"("name", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "uniqByProfileId" ON "Setting"("profileId");

-- AddForeignKey
ALTER TABLE "Setting" ADD FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
