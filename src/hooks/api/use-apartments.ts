import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api, getErrorMessage } from "@/lib/axios";
import { queryKeys } from "@/lib/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ApartmentWithRelations } from "@/services/apartment.service";
import type { ApartmentInput } from "@/schemas/apartment";

// API response types that match our backend structure
export type ApartmentsListResponse = {
  success: boolean;
  data?: {
    apartments: ApartmentWithRelations[];
    pagination: {
      total: number;
      pages: number;
      current: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
};

export type ApartmentResponse = {
  success: boolean;
  data?: ApartmentWithRelations;
  error?: string;
};

export type ApartmentStatsResponse = {
  success: boolean;
  data?: {
    total: number;
    occupied: number;
    vacant: number;
    withReadings: number;
  };
  error?: string;
};

// Hook-specific query params type (all optional for flexibility)
export type ApartmentsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  buildingId?: string;
  ownerId?: string;
  status?: string;
};

// API functions
const apartmentsApi = {
  // Get all apartments with pagination and search
  getApartments: async (
    params: ApartmentsQueryParams = {}
  ): Promise<ApartmentsListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.buildingId) searchParams.append("buildingId", params.buildingId);
    if (params.ownerId) searchParams.append("ownerId", params.ownerId);
    if (params.status) searchParams.append("status", params.status);

    const response = await api.get(`/apartments?${searchParams.toString()}`);
    return response.data;
  },

  // Get apartment by ID
  getApartment: async (id: string): Promise<ApartmentResponse> => {
    const response = await api.get(`/apartments/${id}`);
    return response.data;
  },

  // Get apartment stats
  getApartmentStats: async (): Promise<ApartmentStatsResponse> => {
    const response = await api.get("/apartments/stats");
    return response.data;
  },

  // Create new apartment
  createApartment: async (data: ApartmentInput): Promise<ApartmentResponse> => {
    const response = await api.post("/apartments", data);
    return response.data;
  },

  // Update apartment
  updateApartment: async (
    id: string,
    data: Partial<ApartmentInput>
  ): Promise<ApartmentResponse> => {
    const response = await api.put(`/apartments/${id}`, data);
    return response.data;
  },

  // Delete apartment
  deleteApartment: async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await api.delete(`/apartments/${id}`);
    return response.data;
  },
};

// React Query hooks

/**
 * Hook to fetch apartments list with pagination and search
 */
export function useApartments(params: ApartmentsQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.apartments.all(), params],
    queryFn: () => apartmentsApi.getApartments(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch apartments by owner
 */
export function useApartmentsByOwner(ownerId?: string) {
  return useQuery({
    queryKey: queryKeys.apartments.byOwner(ownerId || ""),
    queryFn: () => apartmentsApi.getApartments({ ownerId }),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single apartment by ID
 */
export function useApartment(id: string) {
  return useQuery({
    queryKey: queryKeys.apartments.detail(id),
    queryFn: () => apartmentsApi.getApartment(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch apartment statistics
 */
export function useApartmentStats() {
  return useQuery({
    queryKey: [...queryKeys.apartments.all(), "stats"],
    queryFn: apartmentsApi.getApartmentStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new apartment
 */
export function useCreateApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apartmentsApi.createApartment,
    onSuccess: (data) => {
      // Invalidate and refetch apartments list
      queryClient.invalidateQueries({ queryKey: queryKeys.apartments.all() });
      // Invalidate building apartments if applicable
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all() });

      toast({
        title: "Succes",
        description:
          data.success && data.data
            ? "Apartamentul a fost creat cu succes."
            : data.error || "Apartamentul a fost creat cu succes.",
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
 * Hook to update an apartment
 */
export function useUpdateApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApartmentInput> }) =>
      apartmentsApi.updateApartment(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch apartments list
      queryClient.invalidateQueries({ queryKey: queryKeys.apartments.all() });
      // Invalidate specific apartment
      queryClient.invalidateQueries({
        queryKey: queryKeys.apartments.detail(variables.id),
      });

      toast({
        title: "Succes",
        description:
          data.success && data.data
            ? "Apartamentul a fost actualizat cu succes."
            : data.error || "Apartamentul a fost actualizat cu succes.",
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
 * Hook to delete an apartment
 */
export function useDeleteApartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apartmentsApi.deleteApartment,
    onSuccess: (data) => {
      // Invalidate and refetch apartments list
      queryClient.invalidateQueries({ queryKey: queryKeys.apartments.all() });

      toast({
        title: "Succes",
        description: data.success
          ? "Apartamentul a fost șters cu succes."
          : data.error || "Apartamentul a fost șters cu succes.",
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
