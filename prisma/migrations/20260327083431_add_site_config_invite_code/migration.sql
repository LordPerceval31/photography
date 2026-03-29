-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL DEFAULT '',
    "heroName" TEXT NOT NULL DEFAULT '',
    "heroTagline" TEXT NOT NULL DEFAULT '',
    "bioTitle" TEXT NOT NULL DEFAULT '',
    "bioParagraph1" TEXT NOT NULL DEFAULT '',
    "bioParagraph2" TEXT NOT NULL DEFAULT '',
    "storyParagraph1" TEXT NOT NULL DEFAULT '',
    "storyParagraph2" TEXT NOT NULL DEFAULT '',
    "darkQuote" TEXT NOT NULL DEFAULT '',
    "darkQuoteAuthor" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");
