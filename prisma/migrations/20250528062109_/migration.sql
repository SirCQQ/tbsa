/*
  Warnings:

  - The values [CANCELLED] on the enum `InviteCodeStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `scope` column on the `permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `resource` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionResource" AS ENUM ('buildings', 'apartments', 'users', 'water_readings', 'invite_codes', 'roles', 'admin_grant');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('read', 'create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('own', 'all', 'building');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BuildingType" ADD VALUE 'COMMERCIAL';
ALTER TYPE "BuildingType" ADD VALUE 'MIXED';

-- AlterEnum
BEGIN;
CREATE TYPE "InviteCodeStatus_new" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');
ALTER TABLE "invite_codes" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invite_codes" ALTER COLUMN "status" TYPE "InviteCodeStatus_new" USING ("status"::text::"InviteCodeStatus_new");
ALTER TYPE "InviteCodeStatus" RENAME TO "InviteCodeStatus_old";
ALTER TYPE "InviteCodeStatus_new" RENAME TO "InviteCodeStatus";
DROP TYPE "InviteCodeStatus_old";
ALTER TABLE "invite_codes" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "resource",
ADD COLUMN     "resource" "PermissionResource" NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "PermissionAction" NOT NULL,
DROP COLUMN "scope",
ADD COLUMN     "scope" "PermissionScope";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_scope_key" ON "permissions"("resource", "action", "scope");
