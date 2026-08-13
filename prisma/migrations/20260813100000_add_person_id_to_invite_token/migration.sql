-- Vincular um convite a uma Pessoa específica (personId)
ALTER TABLE "invite_token" ADD COLUMN "personId" TEXT;

ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_personId_fkey" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "invite_token_personId_idx" ON "invite_token"("personId");
