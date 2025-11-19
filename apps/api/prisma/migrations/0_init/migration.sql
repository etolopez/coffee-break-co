-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "hmacKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actor_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actor_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "gln" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "inputLotCodes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "url" TEXT,
    "vcJwt" TEXT,
    "fileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epcis_events" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "readPoint" TEXT,
    "bizLocation" TEXT,
    "hash" TEXT NOT NULL,
    "signature" TEXT,
    "doc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "epcis_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_events" (
    "id" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "lot" TEXT,
    "serial" TEXT,
    "country" TEXT,
    "city" TEXT,
    "userAgent" TEXT,
    "resolverLatencyMs" INTEGER,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companySize" TEXT,
    "mission" TEXT,
    "logo" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "country" TEXT,
    "city" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCoffees" INTEGER NOT NULL DEFAULT 0,
    "memberSince" INTEGER NOT NULL,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredCoffeeId" TEXT,
    "description" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uniqueSlug" TEXT NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "defaultPricePerBag" TEXT,
    "orderLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coffees" (
    "id" TEXT NOT NULL,
    "coffeeName" TEXT NOT NULL,
    "roastedBy" TEXT,
    "sellerId" TEXT,
    "subscriptionTier" TEXT,
    "origin" TEXT NOT NULL,
    "region" TEXT,
    "altitude" TEXT,
    "process" TEXT,
    "variety" TEXT,
    "harvestYear" TEXT,
    "roastLevel" TEXT,
    "flavorNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "price" TEXT,
    "currency" TEXT DEFAULT 'USD',
    "weight" TEXT,
    "qrCode" TEXT,
    "slug" TEXT,
    "farmPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "roastingCurveImage" TEXT,
    "coordinatesLat" DOUBLE PRECISION,
    "coordinatesLng" DOUBLE PRECISION,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "environmentalPractices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "farm" TEXT,
    "farmer" TEXT,
    "cuppingScore" TEXT,
    "notes" TEXT,
    "harvestDate" TEXT,
    "processingDate" TEXT,
    "producerName" TEXT,
    "producerBio" TEXT,
    "aroma" TEXT,
    "flavor" TEXT,
    "acidity" TEXT,
    "body" TEXT,
    "primaryNotes" TEXT,
    "secondaryNotes" TEXT,
    "finish" TEXT,
    "fermentationTime" TEXT,
    "dryingTime" TEXT,
    "moistureContent" TEXT,
    "screenSize" TEXT,
    "beanDensity" TEXT,
    "roastRecommendation" TEXT,
    "fairTradePremium" TEXT,
    "communityProjects" TEXT,
    "womenWorkerPercentage" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coffees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actor_users_email_key" ON "actor_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_orgId_gtin_key" ON "products"("orgId", "gtin");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_orgId_gln_key" ON "facilities"("orgId", "gln");

-- CreateIndex
CREATE UNIQUE INDEX "lots_orgId_code_key" ON "lots"("orgId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "batches_orgId_code_key" ON "batches"("orgId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "epcis_events_hash_key" ON "epcis_events"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_orgId_key_key" ON "idempotency_records"("orgId", "key");

-- CreateIndex
CREATE INDEX "idempotency_records_expiresAt_idx" ON "idempotency_records"("expiresAt");

-- CreateIndex
CREATE INDEX "scan_events_scannedAt_idx" ON "scan_events"("scannedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_uniqueSlug_key" ON "sellers"("uniqueSlug");

-- CreateIndex
CREATE UNIQUE INDEX "coffees_slug_key" ON "coffees"("slug");

-- CreateIndex
CREATE INDEX "coffees_sellerId_idx" ON "coffees"("sellerId");

-- CreateIndex
CREATE INDEX "coffees_origin_idx" ON "coffees"("origin");

-- CreateIndex
CREATE INDEX "products_gtin_idx" ON "products"("gtin");

-- CreateIndex
CREATE INDEX "lots_code_idx" ON "lots"("code");

-- CreateIndex
CREATE INDEX "batches_code_idx" ON "batches"("code");

-- CreateIndex
CREATE INDEX "epcis_events_orgId_idx" ON "epcis_events"("orgId");

-- CreateIndex
CREATE INDEX "epcis_events_eventTime_idx" ON "epcis_events"("eventTime");

-- CreateIndex
CREATE INDEX "scan_events_gtin_idx" ON "scan_events"("gtin");

-- AddForeignKey
ALTER TABLE "actor_users" ADD CONSTRAINT "actor_users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epcis_events" ADD CONSTRAINT "epcis_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coffees" ADD CONSTRAINT "coffees_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

