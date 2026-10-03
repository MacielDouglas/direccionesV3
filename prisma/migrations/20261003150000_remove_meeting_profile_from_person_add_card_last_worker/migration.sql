-- DropIndex
DROP INDEX "person_familyMemberId_idx";

-- AlterTable: remove o bloco "Perfil Meeting" de person
ALTER TABLE "person"
  DROP COLUMN "analysisTalk",
  DROP COLUMN "baptized",
  DROP COLUMN "betterSpeech",
  DROP COLUMN "bibleReading",
  DROP COLUMN "bibleStudy",
  DROP COLUMN "cleaning",
  DROP COLUMN "elder",
  DROP COLUMN "explainBeliefs",
  DROP COLUMN "familyHead",
  DROP COLUMN "familyMemberId",
  DROP COLUMN "helper",
  DROP COLUMN "lastAssignmentAt",
  DROP COLUMN "makeDisciples",
  DROP COLUMN "microphone",
  DROP COLUMN "midweekChairman",
  DROP COLUMN "ministerialServant",
  DROP COLUMN "pearlsQuest",
  DROP COLUMN "platform",
  DROP COLUMN "prayer",
  DROP COLUMN "publicChairman",
  DROP COLUMN "publicTalk",
  DROP COLUMN "returnVisits",
  DROP COLUMN "sex",
  DROP COLUMN "sound",
  DROP COLUMN "startConversations",
  DROP COLUMN "studyReader",
  DROP COLUMN "treasuresTalk",
  DROP COLUMN "unavailable",
  DROP COLUMN "usher",
  DROP COLUMN "video",
  DROP COLUMN "watchtowerConductor",
  DROP COLUMN "watchtowerReader",
  DROP COLUMN "young";

-- AlterTable: última pessoa que trabalhou na tarjeta (registrada na devolução)
ALTER TABLE "card" ADD COLUMN "lastWorkedByPersonId" TEXT;

-- CreateIndex
CREATE INDEX "card_lastWorkedByPersonId_idx" ON "card"("lastWorkedByPersonId");

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_lastWorkedByPersonId_fkey" FOREIGN KEY ("lastWorkedByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropType
DROP TYPE "Sex";
