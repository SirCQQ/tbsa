/*
  Warnings:

  - You are about to drop the column `billing_period` on the `subscription_plans` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionTypeEnum" AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Enterprise', 'Custom');

-- CreateEnum
CREATE TYPE "SubscriptionBillingIntervalEnum" AS ENUM ('Monthly', 'Yearly');

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "billing_period",
ADD COLUMN     "billing_interval" "SubscriptionBillingIntervalEnum" NOT NULL DEFAULT 'Monthly',
ADD COLUMN     "subscription_type" "SubscriptionTypeEnum" NOT NULL DEFAULT 'Bronze';
