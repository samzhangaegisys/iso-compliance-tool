-- CreateEnum
CREATE TYPE "MappingType" AS ENUM ('EQUIVALENT', 'SIMILAR', 'RELATED');

-- CreateTable
CREATE TABLE "ControlMapping" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sourceControlId" TEXT NOT NULL,
    "targetControlId" TEXT NOT NULL,
    "mappingType" "MappingType" NOT NULL DEFAULT 'EQUIVALENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "ControlMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ControlMapping_orgId_sourceControlId_idx" ON "ControlMapping"("orgId", "sourceControlId");

-- CreateIndex
CREATE INDEX "ControlMapping_orgId_targetControlId_idx" ON "ControlMapping"("orgId", "targetControlId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlMapping_orgId_sourceControlId_targetControlId_key" ON "ControlMapping"("orgId", "sourceControlId", "targetControlId");

-- AddForeignKey
ALTER TABLE "ControlMapping" ADD CONSTRAINT "ControlMapping_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlMapping" ADD CONSTRAINT "ControlMapping_sourceControlId_fkey" FOREIGN KEY ("sourceControlId") REFERENCES "IsoControl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlMapping" ADD CONSTRAINT "ControlMapping_targetControlId_fkey" FOREIGN KEY ("targetControlId") REFERENCES "IsoControl"("id") ON DELETE CASCADE ON UPDATE CASCADE;
