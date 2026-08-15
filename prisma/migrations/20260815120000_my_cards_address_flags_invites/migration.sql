-- CreateEnum
CREATE TYPE "AddressInviteType" AS ENUM ('CELEBRATION', 'CONVENTION', 'OTHER');

-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_invitedByPersonId_fkey";

-- AlterTable
ALTER TABLE "address" DROP COLUMN "invited",
DROP COLUMN "invitedByPersonId",
ADD COLUMN     "noVisits" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "personChanged" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "address_invite" (
    "id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "AddressInviteType" NOT NULL,
    "otherLabel" TEXT,
    "deliveredByPersonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "address_invite_addressId_year_idx" ON "address_invite"("addressId", "year");

-- AddForeignKey
ALTER TABLE "address_invite" ADD CONSTRAINT "address_invite_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_invite" ADD CONSTRAINT "address_invite_deliveredByPersonId_fkey" FOREIGN KEY ("deliveredByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;