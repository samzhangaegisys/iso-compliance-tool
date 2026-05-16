-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('OPERATIONAL', 'SECURITY', 'COMPLIANCE', 'FINANCIAL', 'REPUTATIONAL', 'STRATEGIC', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "RiskTreatment" AS ENUM ('AVOID', 'MITIGATE', 'TRANSFER', 'ACCEPT');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'IN_TREATMENT', 'CLOSED', 'ACCEPTED');

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "RiskCategory" NOT NULL DEFAULT 'OPERATIONAL',
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "treatment" "RiskTreatment" NOT NULL DEFAULT 'MITIGATE',
    "treatmentNotes" TEXT,
    "ownerId" TEXT,
    "ownerName" TEXT,
    "reviewDate" TIMESTAMP(3),
    "status" "RiskStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Risk_orgId_idx" ON "Risk"("orgId");

-- CreateIndex
CREATE INDEX "Risk_projectId_idx" ON "Risk"("projectId");

-- CreateIndex
CREATE INDEX "Risk_orgId_status_idx" ON "Risk"("orgId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_action_idx" ON "AuditLog"("orgId", "action");

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ComplianceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
