import { NextRequest } from "next/server";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { ApartmentController } from "@/controllers/apartment.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  return withAuth(ApartmentController.getOrgApartmentById, [
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.READ,
    },
  ])(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  return withAuth(ApartmentController.updateApartment, [
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.UPDATE,
    },
  ])(request, { params });
}

// PATCH method (alias for PUT)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ apartmentId: string }> }
) {
  return withAuth(ApartmentController.deleteApartment, [
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.DELETE,
    },
  ])(request, { params });
}
