import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, getErrorMessage } from "@/lib/axios";
import { queryKeys } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type {
  BuildingWithDetails,
  BuildingListResult,
  ServiceResult,
} from "@/services/buildings.service";
import type {
  CreateBuildingWithApartmentsData,
  UpdateBuildingData,
} from "@/schemas/building";

// API response types that match our backend structure
export type BuildingsListResponse = ServiceResult<BuildingListResult>;
export type BuildingResponse = ServiceResult<BuildingWithDetails>;

// Hook-specific query params type (all optional for flexibility)
export type BuildingsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

// API functions
const buildingsApi = {
  // Get all buildings with pagination and search
  getBuildings: async (
    params: BuildingsQueryParams = {}
  ): Promise<BuildingsListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);

    const response = await api.get(`/buildings?${searchParams.toString()}`);
    return response.data;
  },

  // Get building by ID
  getBuilding: async (id: string): Promise<BuildingResponse> => {
    const response = await api.get(`/buildings/${id}`);
    return response.data;
  },

  // Create new building
  createBuilding: async (
    data: CreateBuildingWithApartmentsData
  ): Promise<BuildingResponse> => {
    const response = await api.post("/buildings", data);
    return response.data;
  },

  // Update building
  updateBuilding: async (
    id: string,
    data: UpdateBuildingData
  ): Promise<BuildingResponse> => {
    const response = await api.put(`/buildings/${id}`, data);
    return response.data;
  },

  // Delete building
  deleteBuilding: async (id: string): Promise<ServiceResult<void>> => {
    const response = await api.delete(`/buildings/${id}`);
    return response.data;
  },
};

// React Query hooks

/**
 * Hook to fetch buildings list with pagination and search
 */
export function useBuildings(params: BuildingsQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.buildings.all(), params],
    queryFn: () => buildingsApi.getBuildings(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single building by ID
 */
export function useBuilding(id: string) {
  return useQuery({
    queryKey: queryKeys.buildings.detail(id),
    queryFn: () => buildingsApi.getBuilding(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new building
 */
export function useCreateBuilding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: buildingsApi.createBuilding,
    onSuccess: (data) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });

      toast({
        title: "Succes",
        description:
          data.success && data.data
            ? "Clădirea a fost creată cu succes."
            : data.error || "Clădirea a fost creată cu succes.",
      });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Eroare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update a building
 */
export function useUpdateBuilding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBuildingData }) =>
      buildingsApi.updateBuilding(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });
      // Invalidate specific building
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.detail(variables.id),
      });

      toast({
        title: "Succes",
        description:
          data.success && data.data
            ? "Clădirea a fost actualizată cu succes."
            : data.error || "Clădirea a fost actualizată cu succes.",
      });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Eroare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to delete a building
 */
export function useDeleteBuilding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: buildingsApi.deleteBuilding,
    onSuccess: (data) => {
      // Invalidate and refetch buildings list
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });

      toast({
        title: "Succes",
        description: data.success
          ? "Clădirea a fost ștearsă cu succes."
          : data.error || "Clădirea a fost ștearsă cu succes.",
      });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Eroare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
