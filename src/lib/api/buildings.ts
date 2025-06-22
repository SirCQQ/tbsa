import { api } from "@/lib/axios";
import type { CreateBuildingFormData } from "@/lib/validations/building";
import type { Building, Organization } from "@prisma/client";

// Building API functions
export const buildingsApi = {
  // Create a new building
  create: async (data: CreateBuildingFormData) => {
    const response = await api.post("/buildings", data);
    return response.data;
  },

  // Get buildings for current organization
  getAll: async () => {
    const response = await api.get("/buildings");
    return response.data;
  },

  // Get building by ID
  getById: async (id: string) => {
    const response = await api.get(`/buildings/${id}`);
    return response.data;
  },

  // Update building
  update: async (id: string, data: Partial<CreateBuildingFormData>) => {
    const response = await api.put(`/buildings/${id}`, data);
    return response.data;
  },

  // Delete building
  delete: async (id: string) => {
    const response = await api.delete(`/buildings/${id}`);
    return response.data;
  },
};

// Response types
export type BuildingWithOrganization = Building & {
  organization: Pick<Organization, "id" | "name" | "code">;
  apartments?: Array<{
    id: string;
    number: string;
    floor: number;
    isOccupied: boolean;
  }>;
};

export type CreateBuildingResponse = {
  success: true;
  message: string;
  data: BuildingWithOrganization;
};

export type GetBuildingsResponse = {
  success: true;
  data: BuildingWithOrganization[];
};

export type BuildingErrorResponse = {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
};
