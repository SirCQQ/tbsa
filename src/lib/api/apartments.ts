import { api } from "@/lib/axios";
import type {
  CreateApartmentFormData,
  CreateBulkApartmentsFormData,
} from "@/lib/validations/apartment";

// API Response Types
export type ApartmentResponse = {
  id: string;
  number: string;
  floor: number;
  buildingId: string;
  isOccupied: boolean;
  occupantCount: number;
  surface?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateApartmentResponse = {
  success: true;
  message: string;
  data: ApartmentResponse;
};

export type GetApartmentsResponse = {
  success: true;
  data: ApartmentResponse[];
};

export type ApartmentErrorResponse = {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
};

export type BulkCreationResponse = {
  success: true;
  message: string;
  data: {
    total: number;
    successCount: number;
    errorCount: number;
    created: ApartmentResponse[];
    errors: Array<{
      apartment: {
        number: string;
        floor: number;
      };
      error: string;
    }>;
  };
};

// API Functions
export const apartmentsApi = {
  // Create apartment
  create: async (
    data: CreateApartmentFormData
  ): Promise<CreateApartmentResponse> => {
    const response = await api.post<CreateApartmentResponse>(
      "/apartments",
      data
    );
    return response.data;
  },

  // Get apartments by building
  getByBuilding: async (buildingId: string): Promise<GetApartmentsResponse> => {
    const response = await api.get<GetApartmentsResponse>(
      `/apartments?buildingId=${buildingId}`
    );
    return response.data;
  },

  // Get apartment by ID
  getById: async (id: string): Promise<CreateApartmentResponse> => {
    const response = await api.get<CreateApartmentResponse>(
      `/apartments/${id}`
    );
    return response.data;
  },

  // Update apartment
  update: async (
    id: string,
    data: Partial<CreateApartmentFormData>
  ): Promise<CreateApartmentResponse> => {
    const response = await api.patch<CreateApartmentResponse>(
      `/apartments/${id}`,
      data
    );
    return response.data;
  },

  // Delete apartment
  delete: async (id: string): Promise<{ success: true; message: string }> => {
    const response = await api.delete<{
      success: true;
      message: string;
    }>(`/apartments/${id}`);
    return response.data;
  },

  // Bulk create apartments
  createBulk: async (
    data: CreateBulkApartmentsFormData
  ): Promise<BulkCreationResponse> => {
    const response = await api.put<BulkCreationResponse>("/apartments", data);
    return response.data;
  },
};
