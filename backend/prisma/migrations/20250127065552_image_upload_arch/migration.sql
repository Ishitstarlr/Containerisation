/*
  Warnings:

  - You are about to drop the column `faviconUrl` on the `EventBranding` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `EventBranding` table. All the data in the column will be lost.
  - You are about to drop the `CoverImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[coverImageId]` on the table `EventBranding` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[faviconImageId]` on the table `EventBranding` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logoImageId]` on the table `EventBranding` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CoverImage" DROP CONSTRAINT "CoverImage_eventId_fkey";

-- AlterTable
ALTER TABLE "EventBranding" DROP COLUMN "faviconUrl",
DROP COLUMN "logoUrl",
ADD COLUMN     "coverImageId" INTEGER,
ADD COLUMN     "faviconImageId" INTEGER,
ADD COLUMN     "logoImageId" INTEGER;

-- DropTable
DROP TABLE "CoverImage";

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "filePath" TEXT,
    "bucket" TEXT,
    "publicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventBranding_coverImageId_key" ON "EventBranding"("coverImageId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBranding_faviconImageId_key" ON "EventBranding"("faviconImageId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBranding_logoImageId_key" ON "EventBranding"("logoImageId");

-- AddForeignKey
ALTER TABLE "EventBranding" ADD CONSTRAINT "EventBranding_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBranding" ADD CONSTRAINT "EventBranding_faviconImageId_fkey" FOREIGN KEY ("faviconImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBranding" ADD CONSTRAINT "EventBranding_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
