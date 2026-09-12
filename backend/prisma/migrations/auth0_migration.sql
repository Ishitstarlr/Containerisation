-- Step 1: Create temporary columns
ALTER TABLE "User" ADD COLUMN "temp_id" TEXT;

-- Step 2: Create new foreign key columns in related tables
ALTER TABLE "UserProfile" ADD COLUMN "temp_userId" TEXT;
ALTER TABLE "UserEducation" ADD COLUMN "temp_userId" TEXT;
ALTER TABLE "UserExperience" ADD COLUMN "temp_userId" TEXT;
ALTER TABLE "UserSkill" ADD COLUMN "temp_userId" TEXT;
ALTER TABLE "UserSocialProfile" ADD COLUMN "temp_userId" TEXT;
ALTER TABLE "Event" ADD COLUMN "temp_createdById" TEXT;
ALTER TABLE "Application" ADD COLUMN "temp_userId" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN "temp_userId" TEXT;

-- Step 3: Drop existing foreign key constraints
ALTER TABLE "UserProfile" DROP CONSTRAINT IF EXISTS "UserProfile_userId_fkey";
ALTER TABLE "UserEducation" DROP CONSTRAINT IF EXISTS "UserEducation_userId_fkey";
ALTER TABLE "UserExperience" DROP CONSTRAINT IF EXISTS "UserExperience_userId_fkey";
ALTER TABLE "UserSkill" DROP CONSTRAINT IF EXISTS "UserSkill_userId_fkey";
ALTER TABLE "UserSocialProfile" DROP CONSTRAINT IF EXISTS "UserSocialProfile_userId_fkey";
ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_createdById_fkey";
ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_userId_fkey";
ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_userId_fkey";

-- Step 4: Convert ID to string format
UPDATE "User" SET "temp_id" = 'legacy_' || id::text;

-- Step 5: Update foreign key references
UPDATE "UserProfile" SET "temp_userId" = 'legacy_' || "userId"::text;
UPDATE "UserEducation" SET "temp_userId" = 'legacy_' || "userId"::text;
UPDATE "UserExperience" SET "temp_userId" = 'legacy_' || "userId"::text;
UPDATE "UserSkill" SET "temp_userId" = 'legacy_' || "userId"::text;
UPDATE "UserSocialProfile" SET "temp_userId" = 'legacy_' || "userId"::text;
UPDATE "Event" SET "temp_createdById" = 'legacy_' || "createdById"::text;
UPDATE "Application" SET "temp_userId" = 'legacy_' || "userId"::text;
UPDATE "TeamMember" SET "temp_userId" = 'legacy_' || "userId"::text;

-- Step 6: Drop old columns
ALTER TABLE "User" DROP COLUMN "id";
ALTER TABLE "User" DROP COLUMN "passwordHash";
ALTER TABLE "UserProfile" DROP COLUMN "userId";
ALTER TABLE "UserEducation" DROP COLUMN "userId";
ALTER TABLE "UserExperience" DROP COLUMN "userId";
ALTER TABLE "UserSkill" DROP COLUMN "userId";
ALTER TABLE "UserSocialProfile" DROP COLUMN "userId";
ALTER TABLE "Event" DROP COLUMN "createdById";
ALTER TABLE "Application" DROP COLUMN "userId";
ALTER TABLE "TeamMember" DROP COLUMN "userId";

-- Step 7: Rename temporary columns
ALTER TABLE "User" RENAME COLUMN "temp_id" TO "id";
ALTER TABLE "UserProfile" RENAME COLUMN "temp_userId" TO "userId";
ALTER TABLE "UserEducation" RENAME COLUMN "temp_userId" TO "userId";
ALTER TABLE "UserExperience" RENAME COLUMN "temp_userId" TO "userId";
ALTER TABLE "UserSkill" RENAME COLUMN "temp_userId" TO "userId";
ALTER TABLE "UserSocialProfile" RENAME COLUMN "temp_userId" TO "userId";
ALTER TABLE "Event" RENAME COLUMN "temp_createdById" TO "createdById";
ALTER TABLE "Application" RENAME COLUMN "temp_userId" TO "userId";
ALTER TABLE "TeamMember" RENAME COLUMN "temp_userId" TO "userId";

-- Step 8: Add new constraints
ALTER TABLE "User" ADD PRIMARY KEY ("id");
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserEducation" ADD CONSTRAINT "UserEducation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserExperience" ADD CONSTRAINT "UserExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSocialProfile" ADD CONSTRAINT "UserSocialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 