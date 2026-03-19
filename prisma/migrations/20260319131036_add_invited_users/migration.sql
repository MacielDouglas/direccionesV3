-- CreateTable
CREATE TABLE "invite_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invite_token_token_key" ON "invite_token"("token");

-- CreateIndex
CREATE INDEX "invite_token_token_idx" ON "invite_token"("token");

-- CreateIndex
CREATE INDEX "invite_token_organizationId_idx" ON "invite_token"("organizationId");

-- AddForeignKey
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
