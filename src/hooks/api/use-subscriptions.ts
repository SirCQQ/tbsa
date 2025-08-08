import { subscriptionsApi } from "@/lib/api/subscriptions";
import { queryKeys } from "@/lib/react-query";
import type { ApiResponse } from "@/types/api-response";
import { SubscriptionPlan } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

/**
 * React Query hook to fetch all subscription plans
 *
 * @returns { data, isLoading, error }
 *
 * @example
 * const { data, isLoading, error } = useSubscriptions();
 */
export function useSubscriptions() {
  return useQuery<ApiResponse<SubscriptionPlan[]>>({
    queryKey: queryKeys.subscriptions.all(),
    queryFn: subscriptionsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
