/*
  Warnings:

  - You are about to drop the column `organization_id` on the `permissions` table. All the data in the column will be lost.
  - Added the required column `apartment_id` to the `invite_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_organization_id_fkey";

-- DropIndex
DROP INDEX "permissions_organization_id_idx";

-- AlterTable
ALTER TABLE "buildings" ADD COLUMN     "reading_day" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "invite_codes" ADD COLUMN     "apartment_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "organization_id";

-- CreateIndex
CREATE INDEX "buildings_reading_day_idx" ON "buildings"("reading_day");

-- CreateIndex
CREATE INDEX "invite_codes_apartment_id_idx" ON "invite_codes"("apartment_id");

-- AddForeignKey
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
