import { NextRequest } from "next/server";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { BuildingController } from "@/controllers/building.controller";

export async function POST(request: NextRequest) {
  return withAuth(BuildingController.createBuilding, [
    { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.CREATE },
  ])(request);
}

export async function GET(request: NextRequest) {
  return withAuth(BuildingController.getBuildings, [
    { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.READ },
  ])(request);
}
