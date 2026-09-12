/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `EventBranding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventBranding" DROP COLUMN "coverImageUrl";

-- CreateTable
CREATE TABLE "CoverImage" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "publicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoverImage_eventId_key" ON "CoverImage"("eventId");

-- AddForeignKey
ALTER TABLE "CoverImage" ADD CONSTRAINT "CoverImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventBranding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
