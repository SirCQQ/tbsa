import { NextRequest } from "next/server";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { BuildingController } from "@/controllers/building.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildingId: string }> }
) {
  return withAuth(BuildingController.getBuildingStats, [
    {
      resource: ResourcesEnum.BUILDINGS,
      action: ActionsEnum.READ,
    },
  ])(request, { params });
}
