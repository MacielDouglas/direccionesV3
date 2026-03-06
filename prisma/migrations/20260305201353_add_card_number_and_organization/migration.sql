/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,number]` on the table `card` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "card" ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "card_organizationId_idx" ON "card"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "card_organizationId_number_key" ON "card"("organizationId", "number");
