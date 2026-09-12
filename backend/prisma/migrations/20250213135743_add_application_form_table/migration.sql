-- CreateTable
CREATE TABLE "ApplicationForm" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "educationRequired" BOOLEAN NOT NULL DEFAULT false,
    "experienceRequired" BOOLEAN NOT NULL DEFAULT false,
    "profilesRequired" BOOLEAN NOT NULL DEFAULT false,
    "contactRequired" BOOLEAN NOT NULL DEFAULT false,
    "tShirtSizeRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomQuestion" (
    "id" SERIAL NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "options" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "CustomQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationForm_eventId_key" ON "ApplicationForm"("eventId");

-- AddForeignKey
ALTER TABLE "ApplicationForm" ADD CONSTRAINT "ApplicationForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomQuestion" ADD CONSTRAINT "CustomQuestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
