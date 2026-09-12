/*
  Warnings:

  - Added the required column `responses` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userData` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "responses" JSONB NOT NULL,
ADD COLUMN     "userData" JSONB NOT NULL;
