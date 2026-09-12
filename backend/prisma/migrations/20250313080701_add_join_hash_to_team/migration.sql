/*
  Warnings:

  - A unique constraint covering the columns `[hashCode]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashCode` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "hashCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_hashCode_key" ON "Team"("hashCode");
