-- AlterTable
ALTER TABLE "IsoStandard" ADD COLUMN     "orgId" TEXT;

-- CreateIndex
CREATE INDEX "IsoStandard_orgId_idx" ON "IsoStandard"("orgId");

-- AddForeignKey
ALTER TABLE "IsoStandard" ADD CONSTRAINT "IsoStandard_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
