/*
  Warnings:

  - You are about to drop the column `applicationFormId` on the `CustomQuestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId]` on the table `CustomQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `CustomQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomQuestion" DROP CONSTRAINT "CustomQuestion_applicationFormId_fkey";

-- AlterTable
ALTER TABLE "CustomQuestion" DROP COLUMN "applicationFormId",
ADD COLUMN     "eventId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomQuestion_eventId_key" ON "CustomQuestion"("eventId");

-- AddForeignKey
ALTER TABLE "CustomQuestion" ADD CONSTRAINT "CustomQuestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
