/*
  Warnings:

  - You are about to drop the `landing_content` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LandingStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "StoryLinkTarget" AS ENUM ('SELF', 'BLANK');

-- DropTable
DROP TABLE "landing_content";

-- CreateTable
CREATE TABLE "landing_contents" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "status" "LandingStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "short_story" TEXT NOT NULL,
    "image_url" TEXT,
    "image_mobile_url" TEXT,
    "image_alt" TEXT,
    "story_link" TEXT,
    "story_link_target" "StoryLinkTarget" NOT NULL DEFAULT 'SELF',
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" INTEGER,

    CONSTRAINT "landing_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_contents_key_locale_key" ON "landing_contents"("key", "locale");
