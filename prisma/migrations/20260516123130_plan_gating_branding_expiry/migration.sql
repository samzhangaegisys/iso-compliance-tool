-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "brandingDisplayName" TEXT,
ADD COLUMN     "brandingPrimaryColor" TEXT,
ADD COLUMN     "expiryThresholds" INTEGER[] DEFAULT ARRAY[30]::INTEGER[];

-- CreateIndex
CREATE INDEX "Evidence_expiresAt_idx" ON "Evidence"("expiresAt");
