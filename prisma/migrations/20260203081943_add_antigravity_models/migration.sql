-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('TIKTOK', 'SHOPEE', 'LAZADA', 'TOKOPEDIA');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "BrandRole" AS ENUM ('OWNER', 'ADMIN', 'VIEWER');

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "role" "BrandRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntigravityReport" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PROCESSING',
    "kelolaFileName" TEXT,
    "incomeFileName" TEXT,
    "resultJson" JSONB,
    "errorJson" JSONB,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "AntigravityReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brand_clientId_idx" ON "Brand"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_clientId_name_marketplace_key" ON "Brand"("clientId", "name", "marketplace");

-- CreateIndex
CREATE INDEX "BrandMembership_userId_idx" ON "BrandMembership"("userId");

-- CreateIndex
CREATE INDEX "BrandMembership_brandId_idx" ON "BrandMembership"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandMembership_userId_brandId_key" ON "BrandMembership"("userId", "brandId");

-- CreateIndex
CREATE INDEX "AntigravityReport_clientId_brandId_idx" ON "AntigravityReport"("clientId", "brandId");

-- CreateIndex
CREATE INDEX "AntigravityReport_brandId_marketplace_idx" ON "AntigravityReport"("brandId", "marketplace");

-- CreateIndex
CREATE INDEX "AntigravityReport_createdAt_idx" ON "AntigravityReport"("createdAt");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMembership" ADD CONSTRAINT "BrandMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMembership" ADD CONSTRAINT "BrandMembership_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntigravityReport" ADD CONSTRAINT "AntigravityReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntigravityReport" ADD CONSTRAINT "AntigravityReport_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
