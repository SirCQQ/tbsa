import { NextRequest } from "next/server";
import { ResourcesEnum, ActionsEnum } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";
import { OrganizationController } from "@/controllers/organization.controller";

export async function GET(request: NextRequest) {
  return withAuth(OrganizationController.getUserOrganizations, [
    { resource: ResourcesEnum.ORGANIZATIONS, action: ActionsEnum.READ },
  ])(request);
}
