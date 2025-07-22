import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { SubscriptionPlan } from "@prisma/client";




export const subscriptionsApi = {
  getAll: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const response = await api.get<ApiResponse<SubscriptionPlan[]>>("/subscriptions");

    return response.data;
  },
}; 