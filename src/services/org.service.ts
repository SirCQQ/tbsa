import { prisma } from "@/lib/prisma";
import { ServiceResult } from "@/types/api-response";
import { Organization } from "@prisma/client";

const getUserOrganization = async (
  userId: string
): Promise<ServiceResult<Organization[]>> => {
  const organizations = await prisma.organization.findMany({
    where: {
      users: {
        some: {
          userId: userId,
        },
      },
    },
  });
  return {
    success: true,
    data: organizations,
  };
};

const associateUserToOrganization = async (
  userId: string,
  organizationId: string
): Promise<ServiceResult<Organization>> => {
  try {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        users: {
          connectOrCreate: {
            where: {
              userId_organizationId: {
                userId: userId,
                organizationId: organizationId,
              },
            },
            create: {
              userId: userId,
            },
          },
        },
      },
    });
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("Error associating user to organization:", error);
    return {
      success: false,
      error: "Nu s-a putut asocia utilizatorul cu organizația.",
    };
  }
};

const createOrganization = async (
  name: string,
  code: string
): Promise<ServiceResult<Organization>> => {
  try {
    const organization = await prisma.organization.create({
      data: {
        name,
        code,
      },
    });
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("Error creating organization:", error);
    return {
      success: false,
      error: "Nu s-a putut crea organizația.",
    };
  }
};

const removeUserFromOrganization = async (
  userId: string,
  organizationId: string
): Promise<ServiceResult<Organization>> => {
  try {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        users: {
          disconnect: [
            {
              userId_organizationId: {
                userId: userId,
                organizationId: organizationId,
              },
            },
          ],
        },
      },
    });
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("Error removing user from organization:", error, {
      userId,
      organizationId,
    });
    return {
      success: false,
      error: "Nu s-a putut elimina utilizatorul din organizație.",
    };
  }
};

const updateOrganization = async (
  organizationId: string,
  data: Partial<Organization>
): Promise<ServiceResult<Organization>> => {
  try {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data,
    });
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("Error updating organization:", error, {
      organizationId,
      data,
    });
    return {
      success: false,
      error: "Nu s-a putut actualiza organizația.",
    };
  }
};

export const OrganizationService = {
  getUserOrganization,
  associateUserToOrganization,
  createOrganization,
  removeUserFromOrganization,
  updateOrganization,
};
