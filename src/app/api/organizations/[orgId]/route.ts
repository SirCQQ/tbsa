import { NextRequest } from "next/server";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { OrganizationController } from "@/controllers/organization.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  return withAuth(OrganizationController.getOrganizationById, [
    {
      resource: ResourcesEnum.ORGANIZATIONS,
      action: ActionsEnum.READ,
    },
  ])(request, { params });
}
