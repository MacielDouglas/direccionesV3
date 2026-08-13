-- Migração User→Person (conservação de dados)
-- Cria a tabela person, faz backfill a partir de member/user e reponta
-- todas as FKs que referenciavam "user" para referenciarem "person".

-- CreateTable person
CREATE TABLE "person" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- Backfill: uma person por usuário (última organização acessada via member)
INSERT INTO "person" ("id", "organizationId", "userId", "name", "role", "lastActiveAt", "createdAt", "updatedAt")
SELECT m.id, m."organizationId", m."userId", u.name, m.role, COALESCE(m."lastActiveAt", CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "user" u
JOIN LATERAL (
    SELECT *
    FROM "member" mm
    WHERE mm."userId" = u.id
    ORDER BY mm."lastActiveAt" DESC NULLS LAST
    LIMIT 1
) m ON true;

-- Backfill: usuários sem membership (ex.: super user) → person sem organização
INSERT INTO "person" ("id", "organizationId", "userId", "name", "role", "lastActiveAt", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, NULL, u.id, u.name, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "user" u
WHERE NOT EXISTS (SELECT 1 FROM "member" m WHERE m."userId" = u.id);

-- AddForeignKey (person → organization/user)
ALTER TABLE "person" ADD CONSTRAINT "person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "person" ADD CONSTRAINT "person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (person)
CREATE UNIQUE INDEX "person_userId_key" ON "person"("userId");

CREATE INDEX "person_organizationId_idx" ON "person"("organizationId");

-- AddForeignKey (organization de address/card — garante integridade ao apagar a org)
ALTER TABLE "address" ADD CONSTRAINT "address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "card" ADD CONSTRAINT "card_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- ADDRESS
-- ============================================================
ALTER TABLE "address" DROP CONSTRAINT "address_invitedById_fkey";
ALTER TABLE "address" RENAME COLUMN "invitedById" TO "invitedByPersonId";
UPDATE "address" AS a SET "invitedByPersonId" = p.id FROM "person" p WHERE a."invitedByPersonId" = p."userId";
ALTER TABLE "address" ADD CONSTRAINT "address_invitedByPersonId_fkey" FOREIGN KEY ("invitedByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "address" DROP CONSTRAINT "address_createdUserId_fkey";
ALTER TABLE "address" RENAME COLUMN "createdUserId" TO "createdByPersonId";
UPDATE "address" AS a SET "createdByPersonId" = p.id FROM "person" p WHERE a."createdByPersonId" = p."userId";
ALTER TABLE "address" ALTER COLUMN "createdByPersonId" SET NOT NULL;
ALTER TABLE "address" ADD CONSTRAINT "address_createdByPersonId_fkey" FOREIGN KEY ("createdByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER INDEX "address_createdUserId_idx" RENAME TO "address_createdByPersonId_idx";

ALTER TABLE "address" DROP CONSTRAINT "address_updatedUserId_fkey";
ALTER TABLE "address" RENAME COLUMN "updatedUserId" TO "updatedByPersonId";
UPDATE "address" AS a SET "updatedByPersonId" = p.id FROM "person" p WHERE a."updatedByPersonId" = p."userId";
ALTER TABLE "address" ADD CONSTRAINT "address_updatedByPersonId_fkey" FOREIGN KEY ("updatedByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "address" DROP CONSTRAINT "address_pendingDeletionBy_fkey";
ALTER TABLE "address" RENAME COLUMN "pendingDeletionBy" TO "pendingDeletionByPersonId";
UPDATE "address" AS a SET "pendingDeletionByPersonId" = p.id FROM "person" p WHERE a."pendingDeletionByPersonId" = p."userId";
ALTER TABLE "address" ADD CONSTRAINT "address_pendingDeletionByPersonId_fkey" FOREIGN KEY ("pendingDeletionByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- CARD
-- ============================================================
ALTER TABLE "card" DROP CONSTRAINT "card_ownerId_fkey";
ALTER TABLE "card" RENAME COLUMN "ownerId" TO "ownerPersonId";
UPDATE "card" AS c SET "ownerPersonId" = p.id FROM "person" p WHERE c."ownerPersonId" = p."userId";
ALTER TABLE "card" ADD CONSTRAINT "card_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER INDEX "card_ownerId_idx" RENAME TO "card_ownerPersonId_idx";

ALTER TABLE "card" DROP CONSTRAINT "card_createdById_fkey";
ALTER TABLE "card" RENAME COLUMN "createdById" TO "createdByPersonId";
UPDATE "card" AS c SET "createdByPersonId" = p.id FROM "person" p WHERE c."createdByPersonId" = p."userId";
ALTER TABLE "card" ALTER COLUMN "createdByPersonId" SET NOT NULL;
ALTER TABLE "card" ADD CONSTRAINT "card_createdByPersonId_fkey" FOREIGN KEY ("createdByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "card" DROP CONSTRAINT "card_updatedById_fkey";
ALTER TABLE "card" RENAME COLUMN "updatedById" TO "updatedByPersonId";
UPDATE "card" AS c SET "updatedByPersonId" = p.id FROM "person" p WHERE c."updatedByPersonId" = p."userId";
ALTER TABLE "card" ADD CONSTRAINT "card_updatedByPersonId_fkey" FOREIGN KEY ("updatedByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "card" DROP CONSTRAINT "card_assignedUserId_fkey";
ALTER TABLE "card" RENAME COLUMN "assignedUserId" TO "assignedPersonId";
UPDATE "card" AS c SET "assignedPersonId" = p.id FROM "person" p WHERE c."assignedPersonId" = p."userId";
ALTER TABLE "card" ADD CONSTRAINT "card_assignedPersonId_fkey" FOREIGN KEY ("assignedPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER INDEX "card_assignedUserId_idx" RENAME TO "card_assignedPersonId_idx";

-- ============================================================
-- CARD_EVENT
-- ============================================================
ALTER TABLE "card_event" DROP CONSTRAINT "card_event_userId_fkey";
ALTER TABLE "card_event" RENAME COLUMN "userId" TO "personId";
UPDATE "card_event" AS ce SET "personId" = p.id FROM "person" p WHERE ce."personId" = p."userId";
ALTER TABLE "card_event" ALTER COLUMN "personId" DROP NOT NULL;
ALTER TABLE "card_event" ADD CONSTRAINT "card_event_personId_fkey" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER INDEX "card_event_userId_idx" RENAME TO "card_event_personId_idx";

-- ============================================================
-- SURVEY_PIN
-- ============================================================
ALTER TABLE "survey_pin" DROP CONSTRAINT "survey_pin_createdById_fkey";
ALTER TABLE "survey_pin" RENAME COLUMN "createdById" TO "createdByPersonId";
UPDATE "survey_pin" AS sp SET "createdByPersonId" = p.id FROM "person" p WHERE sp."createdByPersonId" = p."userId";
ALTER TABLE "survey_pin" ADD CONSTRAINT "survey_pin_createdByPersonId_fkey" FOREIGN KEY ("createdByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER INDEX "survey_pin_createdById_idx" RENAME TO "survey_pin_createdByPersonId_idx";

ALTER TABLE "survey_pin" DROP CONSTRAINT "survey_pin_confirmedById_fkey";
ALTER TABLE "survey_pin" RENAME COLUMN "confirmedById" TO "confirmedByPersonId";
UPDATE "survey_pin" AS sp SET "confirmedByPersonId" = p.id FROM "person" p WHERE sp."confirmedByPersonId" = p."userId";
ALTER TABLE "survey_pin" ADD CONSTRAINT "survey_pin_confirmedByPersonId_fkey" FOREIGN KEY ("confirmedByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- AGENDA EVENT
-- ============================================================
ALTER TABLE "AgendaEvent" DROP CONSTRAINT "AgendaEvent_conductorId_fkey";
ALTER TABLE "AgendaEvent" RENAME COLUMN "conductorId" TO "conductorPersonId";
UPDATE "AgendaEvent" AS ae SET "conductorPersonId" = p.id FROM "person" p WHERE ae."conductorPersonId" = p."userId";
ALTER TABLE "AgendaEvent" ADD CONSTRAINT "AgendaEvent_conductorPersonId_fkey" FOREIGN KEY ("conductorPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- INVITE_TOKEN
-- ============================================================
ALTER TABLE "invite_token" DROP CONSTRAINT "invite_token_createdById_fkey";
ALTER TABLE "invite_token" RENAME COLUMN "createdById" TO "createdByPersonId";
UPDATE "invite_token" AS it SET "createdByPersonId" = p.id FROM "person" p WHERE it."createdByPersonId" = p."userId";
ALTER TABLE "invite_token" ALTER COLUMN "createdByPersonId" SET NOT NULL;
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_createdByPersonId_fkey" FOREIGN KEY ("createdByPersonId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invite_token" DROP CONSTRAINT "invite_token_usedByUserId_fkey";
ALTER TABLE "invite_token" RENAME COLUMN "usedByUserId" TO "usedByPersonId";
UPDATE "invite_token" AS it SET "usedByPersonId" = p.id FROM "person" p WHERE it."usedByPersonId" = p."userId";
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_usedByPersonId_fkey" FOREIGN KEY ("usedByPersonId") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- DROP member/invitation (gestão de organização agora via person)
-- ============================================================
DROP TABLE "member";
DROP TABLE "invitation";