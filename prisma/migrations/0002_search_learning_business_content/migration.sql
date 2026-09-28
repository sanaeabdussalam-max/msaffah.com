-- Local-only migration draft for MASFAH search learning and business content.
-- Do not apply remotely in this phase.

CREATE TABLE "SearchEvent" (
  "id" TEXT NOT NULL,
  "rawQuery" TEXT NOT NULL,
  "normalizedQuery" TEXT NOT NULL,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "isZeroResult" BOOLEAN NOT NULL DEFAULT false,
  "sessionKey" TEXT,
  "userAgentHash" TEXT,
  "selectedBusinessId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SearchEvent_normalizedQuery_createdAt_idx" ON "SearchEvent"("normalizedQuery", "createdAt");
CREATE INDEX "SearchEvent_isZeroResult_createdAt_idx" ON "SearchEvent"("isZeroResult", "createdAt");

CREATE TABLE "SearchSelection" (
  "id" TEXT NOT NULL,
  "searchEventId" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchSelection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SearchSelection_searchEventId_fkey" FOREIGN KEY ("searchEventId") REFERENCES "SearchEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "SearchSelection_businessId_createdAt_idx" ON "SearchSelection"("businessId", "createdAt");

CREATE TABLE "SearchLearningSuggestion" (
  "id" TEXT NOT NULL,
  "normalizedQuery" TEXT NOT NULL,
  "suggestedAlias" TEXT,
  "interactions" INTEGER NOT NULL DEFAULT 0,
  "uniqueSessions" INTEGER NOT NULL DEFAULT 0,
  "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reviewerNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SearchLearningSuggestion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SearchLearningSuggestion_normalizedQuery_suggestedAlias_key" ON "SearchLearningSuggestion"("normalizedQuery", "suggestedAlias");
CREATE INDEX "SearchLearningSuggestion_status_confidenceScore_idx" ON "SearchLearningSuggestion"("status", "confidenceScore");

CREATE TABLE "BusinessProject" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT,
  "descriptionEn" TEXT,
  "descriptionAr" TEXT,
  "categoryTaxonomyId" TEXT,
  "serviceTaxonomyId" TEXT,
  "projectDate" TIMESTAMP(3),
  "areaLabel" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessProject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessProject_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BusinessProject_businessId_status_projectDate_idx" ON "BusinessProject"("businessId", "status", "projectDate");

CREATE TABLE "BusinessUpdate" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT,
  "bodyEn" TEXT NOT NULL,
  "bodyAr" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessUpdate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessUpdate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BusinessUpdate_businessId_status_publishedAt_idx" ON "BusinessUpdate"("businessId", "status", "publishedAt");

CREATE TABLE "BusinessMediaAsset" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "projectId" TEXT,
  "updateId" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'PENDING_PROVIDER',
  "storageKey" TEXT NOT NULL,
  "publicUrl" TEXT,
  "contentType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "usageType" TEXT NOT NULL DEFAULT 'GALLERY',
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "permissionConfirmed" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessMediaAsset_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessMediaAsset_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BusinessMediaAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BusinessProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BusinessMediaAsset_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "BusinessUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BusinessMediaAsset_businessId_status_usageType_idx" ON "BusinessMediaAsset"("businessId", "status", "usageType");

CREATE TABLE "BusinessMediaReport" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "reporterId" TEXT,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewerNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessMediaReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessMediaReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BusinessMediaReport_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "BusinessMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "BusinessMediaReport_status_createdAt_idx" ON "BusinessMediaReport"("status", "createdAt");
