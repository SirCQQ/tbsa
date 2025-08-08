import { NextRequest } from "next/server";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { ApartmentController } from "@/controllers/apartment.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildingId: string }> }
) {
  return withAuth(ApartmentController.getBuildingApartmentStats, [
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.READ,
    },
  ])(request, { params });
}
