/*
  Warnings:

  - You are about to drop the column `trialRequired` on the `ApplicationForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicationForm" DROP COLUMN "trialRequired",
ADD COLUMN     "tShirtSizeRequired" BOOLEAN NOT NULL DEFAULT false;
