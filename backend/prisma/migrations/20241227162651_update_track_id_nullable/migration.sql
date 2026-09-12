-- DropForeignKey
ALTER TABLE "Prize" DROP CONSTRAINT "Prize_trackId_fkey";

-- AlterTable
ALTER TABLE "Prize" ALTER COLUMN "trackId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;
