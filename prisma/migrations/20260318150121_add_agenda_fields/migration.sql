-- AlterTable
ALTER TABLE "AgendaEvent" ADD COLUMN     "saida" TEXT,
ADD COLUMN     "territorio" TEXT,
ADD COLUMN     "tipo" TEXT;

-- CreateTable
CREATE TABLE "AgendaFieldOption" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgendaFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgendaFieldOption_organizationId_field_idx" ON "AgendaFieldOption"("organizationId", "field");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaFieldOption_organizationId_field_value_key" ON "AgendaFieldOption"("organizationId", "field", "value");

-- AddForeignKey
ALTER TABLE "AgendaFieldOption" ADD CONSTRAINT "AgendaFieldOption_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
