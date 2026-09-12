/*
  Warnings:

  - The values [PARTICIPANT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rsvpStatus` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `coverImageId` on the `EventBranding` table. All the data in the column will be lost.
  - You are about to drop the column `faviconImageId` on the `EventBranding` table. All the data in the column will be lost.
  - You are about to drop the column `logoImageId` on the `EventBranding` table. All the data in the column will be lost.
  - You are about to drop the column `codeOfConductUrl` on the `EventLink` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `EventPerson` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `EventPerson` table. All the data in the column will be lost.
  - You are about to drop the column `rsvpDeadlineDays` on the `EventTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `EventTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Prize` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `Prize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `submissionTime` on the `ProjectSubmission` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ApplicationForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventTheme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FAQ` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Theme` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[auth0Id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `eventStart` on table `EventTimeline` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventEnd` on table `EventTimeline` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trackId` on table `Prize` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `ProjectSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth0Id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `degree` on the `UserEducation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'ORGANIZER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationForm" DROP CONSTRAINT "ApplicationForm_eventId_fkey";

-- DropForeignKey
ALTER TABLE "CustomQuestion" DROP CONSTRAINT "CustomQuestion_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_createdById_fkey";

-- DropForeignKey
ALTER TABLE "EventBranding" DROP CONSTRAINT "EventBranding_coverImageId_fkey";

-- DropForeignKey
ALTER TABLE "EventBranding" DROP CONSTRAINT "EventBranding_faviconImageId_fkey";

-- DropForeignKey
ALTER TABLE "EventBranding" DROP CONSTRAINT "EventBranding_logoImageId_fkey";

-- DropForeignKey
ALTER TABLE "EventTheme" DROP CONSTRAINT "EventTheme_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventTheme" DROP CONSTRAINT "EventTheme_themeId_fkey";

-- DropForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Prize" DROP CONSTRAINT "Prize_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleItem" DROP CONSTRAINT "ScheduleItem_eventId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserEducation" DROP CONSTRAINT "UserEducation_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserExperience" DROP CONSTRAINT "UserExperience_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkill" DROP CONSTRAINT "UserSkill_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSocialProfile" DROP CONSTRAINT "UserSocialProfile_userId_fkey";

-- DropIndex
DROP INDEX "EventBranding_coverImageId_key";

-- DropIndex
DROP INDEX "EventBranding_faviconImageId_key";

-- DropIndex
DROP INDEX "EventBranding_logoImageId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "rsvpStatus",
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdById" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "EventBranding" DROP COLUMN "coverImageId",
DROP COLUMN "faviconImageId",
DROP COLUMN "logoImageId",
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "EventLink" DROP COLUMN "codeOfConductUrl";

-- AlterTable
ALTER TABLE "EventPerson" DROP COLUMN "bio",
DROP COLUMN "linkedinUrl",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "EventTimeline" DROP COLUMN "rsvpDeadlineDays",
DROP COLUMN "timezone",
ALTER COLUMN "eventStart" SET NOT NULL,
ALTER COLUMN "eventEnd" SET NOT NULL;

-- AlterTable
ALTER TABLE "Prize" DROP COLUMN "eventId",
ALTER COLUMN "trackId" SET NOT NULL,
ALTER COLUMN "value" DROP NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProjectSubmission" DROP COLUMN "submissionTime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "passwordHash",
ADD COLUMN     "auth0Id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET DEFAULT 'ORGANIZER',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserEducation" ALTER COLUMN "userId" SET DATA TYPE TEXT,
DROP COLUMN "degree",
ADD COLUMN     "degree" TEXT NOT NULL,
ALTER COLUMN "graduationYear" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserExperience" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserSkill" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserSocialProfile" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "ApplicationForm";

-- DropTable
DROP TABLE "CustomQuestion";

-- DropTable
DROP TABLE "EventTheme";

-- DropTable
DROP TABLE "FAQ";

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "ScheduleItem";

-- DropTable
DROP TABLE "Theme";

-- DropEnum
DROP TYPE "DegreeType";

-- DropEnum
DROP TYPE "RSVPStatus";

-- DropEnum
DROP TYPE "ScheduleItemType";

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Id_key" ON "User"("auth0Id");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducation" ADD CONSTRAINT "UserEducation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExperience" ADD CONSTRAINT "UserExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSocialProfile" ADD CONSTRAINT "UserSocialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
