-- AlterTable
ALTER TABLE "card_event" ADD COLUMN     "actorPersonId" TEXT;

-- AddForeignKey
ALTER TABLE "card_event" ADD CONSTRAINT "card_event_actorPersonId_fkey" FOREIGN KEY ("actorPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
