-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Male', 'Female');

-- AlterTable
ALTER TABLE "address" ALTER COLUMN "createdByPersonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "address_invite" ALTER COLUMN "deliveredByPersonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "card" ALTER COLUMN "createdByPersonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "person" ADD COLUMN     "analysisTalk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "baptized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "betterSpeech" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bibleReading" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bibleStudy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cleaning" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "elder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "explainBeliefs" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "familyHead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "familyMemberId" TEXT,
ADD COLUMN     "helper" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastAssignmentAt" TIMESTAMP(3),
ADD COLUMN     "makeDisciples" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "microphone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "midweekChairman" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ministerialServant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pearlsQuest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platform" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prayer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicChairman" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicTalk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnVisits" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sex" "Sex" NOT NULL DEFAULT 'Male',
ADD COLUMN     "sound" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startConversations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "studyReader" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "treasuresTalk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unavailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usher" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "video" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "watchtowerConductor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "watchtowerReader" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "young" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "person_familyMemberId_idx" ON "person"("familyMemberId");
