-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "cta" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false;
