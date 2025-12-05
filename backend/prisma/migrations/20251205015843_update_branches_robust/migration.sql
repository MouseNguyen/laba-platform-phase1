/*
  Warnings:

  - You are about to alter the column `name` on the `branches` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `code` on the `branches` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `address` on the `branches` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `phone` on the `branches` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - Added the required column `type` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `branches` required. This step will fail if there are existing NULL values in that column.

*/

-- Step 1: Add new columns with defaults first
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "settings" JSONB;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "type" VARCHAR(20);

-- Step 2: Set default type for existing rows
UPDATE "branches" SET "type" = 'FARM' WHERE "type" IS NULL;

-- Step 3: Make type NOT NULL after setting defaults
ALTER TABLE "branches" ALTER COLUMN "type" SET NOT NULL;

-- Step 4: Alter column types
ALTER TABLE "branches" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);
ALTER TABLE "branches" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "branches" ALTER COLUMN "code" SET DATA TYPE VARCHAR(50);
ALTER TABLE "branches" ALTER COLUMN "address" SET DATA TYPE VARCHAR(500);
ALTER TABLE "branches" ALTER COLUMN "phone" SET DATA TYPE VARCHAR(30);
ALTER TABLE "branches" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ;
ALTER TABLE "branches" ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ;
ALTER TABLE "branches" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "branches_type_is_active_idx" ON "branches"("type", "is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "branches_code_idx" ON "branches"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "branches_deleted_at_idx" ON "branches"("deleted_at");
