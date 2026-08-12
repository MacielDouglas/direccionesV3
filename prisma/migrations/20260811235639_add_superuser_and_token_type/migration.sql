-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('OWNER_ONBOARDING', 'INVITE');

-- AlterTable
ALTER TABLE "invite_token" ADD COLUMN     "type" "TokenType" NOT NULL DEFAULT 'INVITE',
ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isSuperUser" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "invite_token_type_idx" ON "invite_token"("type");
