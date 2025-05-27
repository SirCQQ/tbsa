/*
  Warnings:

  - A unique constraint covering the columns `[number,buildingId]` on the table `apartments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InviteCodeStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED');

-- DropIndex
DROP INDEX "apartments_buildingId_number_key";

-- AlterTable
ALTER TABLE "administrators" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- CreateTable
CREATE TABLE "invite_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "status" "InviteCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_apartmentId_key" ON "invite_codes"("apartmentId");

-- CreateIndex
CREATE UNIQUE INDEX "apartments_number_buildingId_key" ON "apartments"("number", "buildingId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "administrators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
