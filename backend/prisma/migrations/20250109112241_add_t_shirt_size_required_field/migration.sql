/*
  Warnings:

  - You are about to drop the column `tShirtSizeRequired` on the `ApplicationForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicationForm" DROP COLUMN "tShirtSizeRequired",
ADD COLUMN     "trialRequired" BOOLEAN NOT NULL DEFAULT false;
