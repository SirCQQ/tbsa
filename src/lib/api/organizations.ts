import { api } from "@/lib/axios";
import { SuccessApiResponse } from "@/types/api-response";
import type { SubscriptionPlan } from "@prisma/client";

// API Response Types
export type OrganizationErrorResponse = {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
};

// Flattened organization structure as returned by the API
export type UserOrganizationResponse = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  subscriptionPlan: SubscriptionPlan | null;
  membershipId: string;
  joinedAt: Date;
  role: string;
};

// Organization detail response (without statistics)
export type OrganizationDetailResponse = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  subscriptionPlan: SubscriptionPlan | null;
  createdAt: Date;
  updatedAt: Date;
};

// Organization statistics response
export type OrganizationStatsResponse = {
  totalBuildings: number;
  totalUsers: number;
  totalApartments: number;
  activeInvites: number;
};

export type GetOrganizationsResponse = SuccessApiResponse<
  UserOrganizationResponse[]
>;

export type GetOrganizationDetailResponse =
  SuccessApiResponse<OrganizationDetailResponse>;

export type GetOrganizationStatsResponse =
  SuccessApiResponse<OrganizationStatsResponse>;

// API Functions
export const organizationsApi = {
  // Get user organizations
  getUserOrganizations: async (): Promise<
    SuccessApiResponse<UserOrganizationResponse[]>
  > => {
    const response =
      await api.get<SuccessApiResponse<UserOrganizationResponse[]>>(
        "/organizations"
      );
    return response.data;
  },

  // Get organization by ID
  getById: async (
    orgId: string
  ): Promise<SuccessApiResponse<OrganizationDetailResponse>> => {
    const response = await api.get<
      SuccessApiResponse<OrganizationDetailResponse>
    >(`/organizations/${orgId}`);
    return response.data;
  },

  // Get organization statistics
  getStats: async (
    orgId: string
  ): Promise<SuccessApiResponse<OrganizationStatsResponse>> => {
    const response = await api.get<
      SuccessApiResponse<OrganizationStatsResponse>
    >(`/organizations/${orgId}/stats`);
    return response.data;
  },
};
