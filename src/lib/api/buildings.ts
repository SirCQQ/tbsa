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
export type ApartmentData = {
  id: string;
  number: string;
  floor: number;
  isOccupied: boolean;
  occupantCount: number;
  surface: number | null;
};

export type BuildingWithOrganization = Building & {
  organization: Pick<Organization, "id" | "name" | "code">;
  apartments?: ApartmentData[];
};

export type BuildingWithApartments = BuildingWithOrganization & {
  apartments: ApartmentData[];
  apartmentsByFloor: Record<string, ApartmentData[]>;
  occupiedApartments: number;
  vacantApartments: number;
};

export type CreateBuildingResponse = {
  success: true;
  message: string;
  data: BuildingWithOrganization;
};

export type GetBuildingWithApartmentsResponse = {
  success: true;
  data: BuildingWithApartments;
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
