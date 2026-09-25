-- REVIEW ONLY: generated from the current Prisma schema.
-- NOT APPLIED to Supabase. Do not deploy until the existing Supabase schema
-- has been inspected and this migration is approved.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "Location" (
  "id" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "parentId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Taxonomy" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "parentId" TEXT,
  "isOther" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaxonomyAlias" (
  "id" TEXT NOT NULL,
  "taxonomyId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  CONSTRAINT "TaxonomyAlias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaxonomySuggestion" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT,
  "sourceText" TEXT,
  "submittedBy" TEXT,
  "locationId" TEXT,
  "matchedTaxonomyId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reviewerNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TaxonomySuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Business" (
  "id" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "descriptionEn" TEXT,
  "descriptionAr" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "tier" TEXT NOT NULL DEFAULT 'FREE',
  "listingType" TEXT NOT NULL DEFAULT 'ORGANIC',
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "isSearchable" BOOLEAN NOT NULL DEFAULT false,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "phone" TEXT NOT NULL,
  "whatsapp" TEXT,
  "openingHours" JSONB,
  "priceLevel" INTEGER NOT NULL DEFAULT 1,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessLocation" (
  "businessId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "BusinessLocation_pkey" PRIMARY KEY ("businessId", "locationId")
);

CREATE TABLE "BusinessTaxonomy" (
  "businessId" TEXT NOT NULL,
  "taxonomyId" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'ADMIN',
  CONSTRAINT "BusinessTaxonomy_pkey" PRIMARY KEY ("businessId", "taxonomyId")
);

CREATE TABLE "Photo" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "text" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessClaim" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "claimantId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "evidence" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "BusinessClaim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "contactName" TEXT,
  "contactPhone" TEXT,
  "contactEmail" TEXT,
  "requirement" TEXT NOT NULL,
  "parsedIntent" JSONB,
  "photoUrl" TEXT,
  "locationId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteResponse" (
  "id" TEXT NOT NULL,
  "quoteRequestId" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "price" DOUBLE PRECISION,
  "availability" TEXT,
  "message" TEXT,
  "photoUrl" TEXT,
  "estimatedTime" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteResponse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");
CREATE INDEX "Location_kind_isActive_idx" ON "Location"("kind", "isActive");
CREATE UNIQUE INDEX "Taxonomy_kind_slug_key" ON "Taxonomy"("kind", "slug");
CREATE INDEX "Taxonomy_kind_isActive_idx" ON "Taxonomy"("kind", "isActive");
CREATE INDEX "Taxonomy_parentId_idx" ON "Taxonomy"("parentId");
CREATE UNIQUE INDEX "TaxonomyAlias_taxonomyId_value_locale_key" ON "TaxonomyAlias"("taxonomyId", "value", "locale");
CREATE INDEX "TaxonomyAlias_value_idx" ON "TaxonomyAlias"("value");
CREATE INDEX "TaxonomySuggestion_status_kind_idx" ON "TaxonomySuggestion"("status", "kind");
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE INDEX "BusinessLocation_locationId_idx" ON "BusinessLocation"("locationId");
CREATE INDEX "BusinessTaxonomy_taxonomyId_idx" ON "BusinessTaxonomy"("taxonomyId");

ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Taxonomy" ADD CONSTRAINT "Taxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaxonomyAlias" ADD CONSTRAINT "TaxonomyAlias_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaxonomySuggestion" ADD CONSTRAINT "TaxonomySuggestion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaxonomySuggestion" ADD CONSTRAINT "TaxonomySuggestion_matchedTaxonomyId_fkey" FOREIGN KEY ("matchedTaxonomyId") REFERENCES "Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BusinessLocation" ADD CONSTRAINT "BusinessLocation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessLocation" ADD CONSTRAINT "BusinessLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessTaxonomy" ADD CONSTRAINT "BusinessTaxonomy_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessTaxonomy" ADD CONSTRAINT "BusinessTaxonomy_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessClaim" ADD CONSTRAINT "BusinessClaim_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteResponse" ADD CONSTRAINT "QuoteResponse_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteResponse" ADD CONSTRAINT "QuoteResponse_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Future WhatsApp Business Platform tables. Integration remains disabled.
CREATE TABLE "WhatsappAccount" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'META_WHATSAPP_CLOUD_API',
  "displayPhoneNumber" TEXT,
  "phoneNumberId" TEXT,
  "businessAccountId" TEXT,
  "secretRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DISABLED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsappAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsappContact" (
  "id" TEXT NOT NULL,
  "waId" TEXT NOT NULL,
  "displayName" TEXT,
  "phoneE164" TEXT,
  "locale" TEXT,
  "consentStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "consentAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsappContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsappConversation" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "language" TEXT,
  "consentStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "lastIntentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsappConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsappMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "direction" TEXT NOT NULL,
  "messageType" TEXT NOT NULL,
  "text" TEXT,
  "mediaUrl" TEXT,
  "mediaMimeType" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "providerStatus" TEXT,
  "rawPayloadRef" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsappMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationIntent" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "sourceMessageId" TEXT,
  "intentJson" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "outcome" TEXT NOT NULL,
  "clarificationQuestion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConversationIntent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteRequestLink" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "quoteRequestId" TEXT NOT NULL,
  "relationType" TEXT NOT NULL DEFAULT 'CREATED_FROM_WHATSAPP',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteRequestLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HumanHandoff" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "assignedTo" TEXT,
  "note" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "HumanHandoff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WhatsappAccount_phoneNumberId_key" ON "WhatsappAccount"("phoneNumberId");
CREATE UNIQUE INDEX "WhatsappContact_waId_key" ON "WhatsappContact"("waId");
CREATE UNIQUE INDEX "WhatsappConversation_accountId_contactId_status_key" ON "WhatsappConversation"("accountId", "contactId", "status");
CREATE UNIQUE INDEX "WhatsappMessage_providerMessageId_key" ON "WhatsappMessage"("providerMessageId");
CREATE INDEX "WhatsappConversation_contactId_updatedAt_idx" ON "WhatsappConversation"("contactId", "updatedAt");
CREATE INDEX "WhatsappMessage_conversationId_createdAt_idx" ON "WhatsappMessage"("conversationId", "createdAt");
CREATE INDEX "ConversationIntent_conversationId_createdAt_idx" ON "ConversationIntent"("conversationId", "createdAt");
CREATE UNIQUE INDEX "QuoteRequestLink_conversationId_quoteRequestId_key" ON "QuoteRequestLink"("conversationId", "quoteRequestId");
CREATE INDEX "HumanHandoff_status_requestedAt_idx" ON "HumanHandoff"("status", "requestedAt");

ALTER TABLE "WhatsappConversation" ADD CONSTRAINT "WhatsappConversation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WhatsappAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WhatsappConversation" ADD CONSTRAINT "WhatsappConversation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "WhatsappContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsappConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationIntent" ADD CONSTRAINT "ConversationIntent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsappConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequestLink" ADD CONSTRAINT "QuoteRequestLink_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsappConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequestLink" ADD CONSTRAINT "QuoteRequestLink_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HumanHandoff" ADD CONSTRAINT "HumanHandoff_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "WhatsappConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
