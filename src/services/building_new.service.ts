// src/services/building.service.ts

import { PrismaClient, Building, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generate a unique building code (6-8 uppercase alphanumeric characters)
 */
async function generateUniqueBuildingCode(
  organizationId: string,
  length = 6
): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code: string;
  let exists = true;

  do {
    code = Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");

    // Check uniqueness within the organization
    const building = await prisma.building.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });
    exists = !!building;
  } while (exists);

  return code;
}

export class BuildingService {
  /**
   * Create a new building (code is auto-generated)
   */
  async createBuilding(
    data: Omit<Prisma.BuildingCreateInput, "code"> & {
      organization: { connect: { id: string } };
    }
  ): Promise<Building> {
    const organizationId = data.organization.connect.id;
    const code = await generateUniqueBuildingCode(organizationId);

    return prisma.building.create({
      data: {
        ...data,
        code,
      },
    });
  }

  /**
   * Get a building by its ID
   */
  async getBuildingById(id: string): Promise<Building | null> {
    return prisma.building.findUnique({
      where: { id },
    });
  }

  /**
   * List all buildings for an organization
   */
  async getBuildingsByOrganization(
    organizationId: string
  ): Promise<Building[]> {
    return prisma.building.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update a building by its ID (code cannot be updated)
   */
  async updateBuilding(
    id: string,
    data: Omit<Prisma.BuildingUpdateInput, "code">
  ): Promise<Building> {
    return prisma.building.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete a building (set deletedAt)
   */
  async softDeleteBuilding(id: string): Promise<Building> {
    return prisma.building.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Find a building by code (and organization)
   */
  async getBuildingByCode(
    organizationId: string,
    code: string
  ): Promise<Building | null> {
    return prisma.building.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });
  }

  /**
   * List apartments in a building
   */
  async getApartmentsInBuilding(buildingId: string) {
    return prisma.apartment.findMany({
      where: { buildingId },
      orderBy: { number: "asc" },
    });
  }

  /**
   * Get building with apartments and residents
   */
  async getBuildingWithApartmentsAndResidents(id: string) {
    return prisma.building.findUnique({
      where: { id },
      include: {
        apartments: {
          include: {
            apartmentResidents: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }
}
