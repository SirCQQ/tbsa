import { NextRequest } from "next/server";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { BuildingController } from "@/controllers/building.controller";
import { withAuth } from "@/lib/withAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildingId: string }> }
) {
  return withAuth(BuildingController.getBuildingById, [
    { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.READ },
  ])(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ buildingId: string }> }
) {
  return withAuth(BuildingController.updateBuilding, [
    { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.UPDATE },
  ])(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ buildingId: string }> }
) {
  return withAuth(BuildingController.deleteBuilding, [
    { resource: ResourcesEnum.BUILDINGS, action: ActionsEnum.DELETE },
  ])(request, { params });
}
