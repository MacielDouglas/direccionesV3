-- DropForeignKey
ALTER TABLE "survey_pin" DROP CONSTRAINT "survey_pin_createdById_fkey";

-- AlterTable
ALTER TABLE "survey_pin" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "survey_pin" ADD CONSTRAINT "survey_pin_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
