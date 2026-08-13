-- AlterTable
ALTER TABLE "invite_token" ADD COLUMN     "personId" TEXT;

-- AddForeignKey
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_personId_fkey" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
