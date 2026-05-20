-- DropForeignKey
ALTER TABLE "GalleryPhoto" DROP CONSTRAINT "GalleryPhoto_galleryId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryPhoto" DROP CONSTRAINT "GalleryPhoto_photoId_fkey";

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "description",
DROP COLUMN "isAboutPicture",
ADD COLUMN     "isAboutPicture1" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAboutPicture2" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAboutPicture3" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "seoDescription" TEXT DEFAULT '',
ADD COLUMN     "seoTitle" TEXT DEFAULT '',
ADD COLUMN     "templateConfig" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeTemplateId" TEXT,
ADD COLUMN     "cloudinaryKey" TEXT,
ADD COLUMN     "cloudinaryName" TEXT,
ADD COLUMN     "cloudinarySecret" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "emailjsPublicKey" TEXT,
ADD COLUMN     "emailjsServiceId" TEXT,
ADD COLUMN     "emailjsTemplateId" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "subdomain" TEXT,
ADD COLUMN     "tempCode" TEXT,
ADD COLUMN     "tempCodeExpiry" TIMESTAMP(3),
ALTER COLUMN "password" DROP NOT NULL;

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
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "previewUrl" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTemplate" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTemplate_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "GalleryGuest" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastVisitedAt" TIMESTAMP(3),

    CONSTRAINT "GalleryGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretPassword" (
    "used" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "guestId" TEXT NOT NULL,

    CONSTRAINT "SecretPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryGuest_galleryId_email_key" ON "GalleryGuest"("galleryId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_publicId_key" ON "Photo"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_userId_key" ON "SiteConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_subdomain_key" ON "User"("subdomain");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeTemplateId_fkey" FOREIGN KEY ("activeTemplateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteConfig" ADD CONSTRAINT "SiteConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTemplate" ADD CONSTRAINT "UserTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTemplate" ADD CONSTRAINT "UserTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryGuest" ADD CONSTRAINT "GalleryGuest_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretPassword" ADD CONSTRAINT "SecretPassword_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GalleryGuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
