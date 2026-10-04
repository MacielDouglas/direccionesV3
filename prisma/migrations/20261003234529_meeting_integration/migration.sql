-- CreateTable
CREATE TABLE "meeting_connection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_week_program" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "weekEnd" TEXT NOT NULL,
    "congregationName" TEXT NOT NULL DEFAULT '',
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_week_program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_connection_organizationId_key" ON "meeting_connection"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_week_program_organizationId_weekStart_key" ON "meeting_week_program"("organizationId", "weekStart");

-- AddForeignKey
ALTER TABLE "meeting_connection" ADD CONSTRAINT "meeting_connection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_week_program" ADD CONSTRAINT "meeting_week_program_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
