/*
  Warnings:

  - You are about to drop the `Busqueda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `busqueda_pin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Busqueda" DROP CONSTRAINT "Busqueda_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "busqueda_pin" DROP CONSTRAINT "busqueda_pin_busquedaId_fkey";

-- DropForeignKey
ALTER TABLE "busqueda_pin" DROP CONSTRAINT "busqueda_pin_confirmedById_fkey";

-- DropForeignKey
ALTER TABLE "busqueda_pin" DROP CONSTRAINT "busqueda_pin_createdById_fkey";

-- DropTable
DROP TABLE "Busqueda";

-- DropTable
DROP TABLE "busqueda_pin";

-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_pin" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "PinStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_pin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "survey_organizationId_idx" ON "survey"("organizationId");

-- CreateIndex
CREATE INDEX "survey_pin_surveyId_idx" ON "survey_pin"("surveyId");

-- CreateIndex
CREATE INDEX "survey_pin_createdById_idx" ON "survey_pin"("createdById");

-- AddForeignKey
ALTER TABLE "survey" ADD CONSTRAINT "survey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_pin" ADD CONSTRAINT "survey_pin_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_pin" ADD CONSTRAINT "survey_pin_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_pin" ADD CONSTRAINT "survey_pin_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
