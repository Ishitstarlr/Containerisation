-- AlterTable
ALTER TABLE "EventTimeline" ALTER COLUMN "applicationsStart" DROP NOT NULL,
ALTER COLUMN "applicationsEnd" DROP NOT NULL,
ALTER COLUMN "eventStart" DROP NOT NULL,
ALTER COLUMN "eventEnd" DROP NOT NULL;
