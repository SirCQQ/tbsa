-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('RESIDENTIAL');

-- AlterTable
ALTER TABLE "buildings" ADD COLUMN     "description" TEXT,
ADD COLUMN     "floors" INTEGER,
ADD COLUMN     "hasElevator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGarden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasParking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalApartments" INTEGER,
ADD COLUMN     "type" "BuildingType" NOT NULL DEFAULT 'RESIDENTIAL',
ADD COLUMN     "yearBuilt" INTEGER;
