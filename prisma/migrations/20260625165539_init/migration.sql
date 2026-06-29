-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL,
    "metaDescription" TEXT,
    "seoScore" INTEGER NOT NULL,
    "h1Count" INTEGER NOT NULL,
    "imageCount" INTEGER NOT NULL,
    "missingAltCount" INTEGER NOT NULL,
    "internalLinks" INTEGER NOT NULL,
    "externalLinks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
