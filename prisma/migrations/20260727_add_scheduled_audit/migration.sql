-- CreateTable
CREATE TABLE "ScheduledAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'weekly',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "lastAttemptAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledAudit_userId_idx" ON "ScheduledAudit"("userId");

-- CreateIndex
CREATE INDEX "ScheduledAudit_status_nextRunAt_idx" ON "ScheduledAudit"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "ScheduledAudit_userId_websiteUrl_idx" ON "ScheduledAudit"("userId", "websiteUrl");

-- AddForeignKey
ALTER TABLE "ScheduledAudit" ADD CONSTRAINT "ScheduledAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
