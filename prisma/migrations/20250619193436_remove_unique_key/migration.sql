/*
  Warnings:

  - A unique constraint covering the columns `[apartment_id,user_id]` on the table `apartment_residents` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "apartment_residents_apartment_id_user_id_role_key";

-- CreateIndex
CREATE UNIQUE INDEX "apartment_residents_apartment_id_user_id_key" ON "apartment_residents"("apartment_id", "user_id");
