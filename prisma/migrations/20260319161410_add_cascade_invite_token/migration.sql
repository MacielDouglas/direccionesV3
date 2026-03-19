-- DropForeignKey
ALTER TABLE "invite_token" DROP CONSTRAINT "invite_token_createdById_fkey";

-- AddForeignKey
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
