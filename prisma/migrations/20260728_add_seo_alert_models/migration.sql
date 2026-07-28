-- CreateTable
CREATE TABLE "AlertPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "improvementAlerts" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "thresholds" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "previousAuditId" TEXT,
    "currentAuditId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "changeType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "emailSentAt" TIMESTAMP(3),
    "deliveryId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SEOAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertPreference_userId_idx" ON "AlertPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertPreference_userId_websiteUrl_key" ON "AlertPreference"("userId", "websiteUrl");

-- CreateIndex
CREATE INDEX "SEOAlert_userId_idx" ON "SEOAlert"("userId");

-- CreateIndex
CREATE INDEX "SEOAlert_userId_createdAt_idx" ON "SEOAlert"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SEOAlert_userId_websiteUrl_createdAt_idx" ON "SEOAlert"("userId", "websiteUrl", "createdAt");

-- CreateIndex
CREATE INDEX "SEOAlert_emailStatus_idx" ON "SEOAlert"("emailStatus");

-- CreateIndex
CREATE UNIQUE INDEX "SEOAlert_previousAuditId_currentAuditId_changeType_key" ON "SEOAlert"("previousAuditId", "currentAuditId", "changeType");

-- AddForeignKey
ALTER TABLE "AlertPreference" ADD CONSTRAINT "AlertPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOAlert" ADD CONSTRAINT "SEOAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
