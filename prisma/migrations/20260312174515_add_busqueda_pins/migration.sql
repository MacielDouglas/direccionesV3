-- CreateEnum
CREATE TYPE "PinStatus" AS ENUM ('PENDING', 'SUGGESTED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "Busqueda" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Busqueda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "busqueda_pin" (
    "id" TEXT NOT NULL,
    "busquedaId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "PinStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "busqueda_pin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "busqueda_pin_busquedaId_idx" ON "busqueda_pin"("busquedaId");

-- CreateIndex
CREATE INDEX "busqueda_pin_createdById_idx" ON "busqueda_pin"("createdById");

-- AddForeignKey
ALTER TABLE "Busqueda" ADD CONSTRAINT "Busqueda_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busqueda_pin" ADD CONSTRAINT "busqueda_pin_busquedaId_fkey" FOREIGN KEY ("busquedaId") REFERENCES "Busqueda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busqueda_pin" ADD CONSTRAINT "busqueda_pin_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busqueda_pin" ADD CONSTRAINT "busqueda_pin_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
