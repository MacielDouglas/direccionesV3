-- AlterTable
ALTER TABLE "address" ADD COLUMN     "pendingDeletion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingDeletionAt" TIMESTAMP(3),
ADD COLUMN     "pendingDeletionBy" TEXT;
