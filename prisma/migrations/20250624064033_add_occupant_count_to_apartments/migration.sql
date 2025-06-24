-- AlterEnum
ALTER TYPE "ResourcesEnum" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "apartments" ADD COLUMN     "occupant_count" INTEGER NOT NULL DEFAULT 0;
