import { NextRequest } from "next/server";

import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { ApartmentController } from "@/controllers/apartment.controller";

export async function POST(request: NextRequest) {
  return withAuth(ApartmentController.createApartment, [
    { resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.CREATE },
  ])(request);
}

export async function PUT(request: NextRequest) {
  return withAuth(
    ApartmentController.createBulkApartments,
    [{ resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.CREATE }],
    true
  )(request);
}

export async function GET(request: NextRequest) {
  return withAuth(
    ApartmentController.getBuildingApartments,
    [{ resource: ResourcesEnum.APARTMENTS, action: ActionsEnum.READ }],
    true
  )(request);
}
