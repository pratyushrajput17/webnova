-- CreateTable
CREATE TABLE "ReportBranding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "logoUrl" TEXT,
    "preparedBy" TEXT,
    "websiteUrl" TEXT,
    "supportEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportBranding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportBranding_userId_key" ON "ReportBranding"("userId");

-- AddForeignKey
ALTER TABLE "ReportBranding" ADD CONSTRAINT "ReportBranding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
