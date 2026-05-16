-- CreateEnum
CREATE TYPE "VendorRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'PENDING_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PolicyCategory" AS ENUM ('INFOSEC', 'ACCEPTABLE_USE', 'DATA_RETENTION', 'INCIDENT_RESPONSE', 'ACCESS_CONTROL', 'BUSINESS_CONTINUITY', 'CHANGE_MANAGEMENT', 'THIRD_PARTY', 'PRIVACY', 'OTHER');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "service" TEXT,
    "dataCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inherentRisk" "VendorRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certExpiry" TIMESTAMP(3),
    "lastReviewDate" TIMESTAMP(3),
    "dpaSignedOn" TIMESTAMP(3),
    "ownerId" TEXT,
    "ownerName" TEXT,
    "contactEmail" TEXT,
    "websiteUrl" TEXT,
    "notes" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "PolicyCategory" NOT NULL DEFAULT 'INFOSEC',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerId" TEXT,
    "ownerName" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vendor_orgId_idx" ON "Vendor"("orgId");

-- CreateIndex
CREATE INDEX "Vendor_orgId_status_idx" ON "Vendor"("orgId", "status");

-- CreateIndex
CREATE INDEX "Policy_orgId_idx" ON "Policy"("orgId");

-- CreateIndex
CREATE INDEX "Policy_orgId_status_idx" ON "Policy"("orgId", "status");

-- CreateIndex
CREATE INDEX "PolicyVersion_policyId_idx" ON "PolicyVersion"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_policyId_version_key" ON "PolicyVersion"("policyId", "version");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
