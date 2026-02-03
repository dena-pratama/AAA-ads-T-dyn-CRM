-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CLIENT_ADMIN', 'CS');

-- CreateEnum
CREATE TYPE "AdPlatform" AS ENUM ('META', 'GOOGLE', 'TIKTOK', 'SHOPEE', 'TOKOPEDIA', 'LAZADA', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'LOST', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "logo" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stages" JSONB NOT NULL DEFAULT '[]',
    "customFields" JSONB NOT NULL DEFAULT '[]',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "platform" "AdPlatform" NOT NULL DEFAULT 'OTHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdSpendLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "campaignId" TEXT,
    "date" DATE NOT NULL,
    "platform" "AdPlatform" NOT NULL,
    "campaignName" TEXT NOT NULL,
    "spend" DECIMAL(15,2) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "ctr" DECIMAL(10,4),
    "cpc" DECIMAL(10,2),
    "cpm" DECIMAL(10,2),
    "rawData" JSONB,
    "importBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdSpendLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "campaignId" TEXT,
    "campaignName" TEXT NOT NULL,
    "pipelineId" TEXT,
    "currentStage" TEXT NOT NULL,
    "customData" JSONB NOT NULL DEFAULT '{}',
    "value" DECIMAL(15,2),
    "status" "LeadStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "csNumber" TEXT,
    "leadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStageHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movedById" TEXT,

    CONSTRAINT "LeadStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MappingConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "platform" "AdPlatform" NOT NULL,
    "columnMappings" JSONB NOT NULL,
    "transformations" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MappingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportHistory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "platform" "AdPlatform" NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "successRows" INTEGER NOT NULL,
    "errorRows" INTEGER NOT NULL,
    "errors" JSONB,
    "importedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "charts" JSONB NOT NULL DEFAULT '[]',
    "preset" TEXT NOT NULL DEFAULT 'CUSTOM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clientId_idx" ON "User"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- CreateIndex
CREATE INDEX "Client_slug_idx" ON "Client"("slug");

-- CreateIndex
CREATE INDEX "Pipeline_clientId_idx" ON "Pipeline"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_clientId_name_key" ON "Pipeline"("clientId", "name");

-- CreateIndex
CREATE INDEX "Campaign_clientId_idx" ON "Campaign"("clientId");

-- CreateIndex
CREATE INDEX "Campaign_name_idx" ON "Campaign"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_clientId_originalName_key" ON "Campaign"("clientId", "originalName");

-- CreateIndex
CREATE INDEX "AdSpendLog_clientId_date_idx" ON "AdSpendLog"("clientId", "date");

-- CreateIndex
CREATE INDEX "AdSpendLog_campaignName_idx" ON "AdSpendLog"("campaignName");

-- CreateIndex
CREATE INDEX "AdSpendLog_campaignId_idx" ON "AdSpendLog"("campaignId");

-- CreateIndex
CREATE INDEX "AdSpendLog_importBatchId_idx" ON "AdSpendLog"("importBatchId");

-- CreateIndex
CREATE INDEX "Lead_clientId_campaignName_idx" ON "Lead"("clientId", "campaignName");

-- CreateIndex
CREATE INDEX "Lead_currentStage_idx" ON "Lead"("currentStage");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_leadDate_idx" ON "Lead"("leadDate");

-- CreateIndex
CREATE INDEX "LeadStageHistory_leadId_idx" ON "LeadStageHistory"("leadId");

-- CreateIndex
CREATE INDEX "MappingConfig_clientId_idx" ON "MappingConfig"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "MappingConfig_clientId_name_key" ON "MappingConfig"("clientId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ImportHistory_batchId_key" ON "ImportHistory"("batchId");

-- CreateIndex
CREATE INDEX "ImportHistory_clientId_idx" ON "ImportHistory"("clientId");

-- CreateIndex
CREATE INDEX "ImportHistory_batchId_idx" ON "ImportHistory"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardConfig_clientId_key" ON "DashboardConfig"("clientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdSpendLog" ADD CONSTRAINT "AdSpendLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdSpendLog" ADD CONSTRAINT "AdSpendLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadStageHistory" ADD CONSTRAINT "LeadStageHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MappingConfig" ADD CONSTRAINT "MappingConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardConfig" ADD CONSTRAINT "DashboardConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
