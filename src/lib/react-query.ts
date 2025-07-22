import { QueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "./axios";

// Create a client with custom configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 1000 * 60 * 5, // 5 minutes

      // Time in milliseconds after data is considered stale
      staleTime: 1000 * 60 * 1, // 1 minute

      // Number of times to retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (
            axiosError.response?.status &&
            axiosError.response.status >= 400 &&
            axiosError.response.status < 500
          ) {
            return false;
          }
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Delay between retries (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Number of times to retry failed mutations
      retry: 1,

      // Global error handler for mutations
      onError: (error) => {
        console.error("Mutation error:", getErrorMessage(error));
      },
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth related queries
  auth: {
    user: () => ["auth", "user"] as const,
    session: () => ["auth", "session"] as const,
  },

  // User related queries
  users: {
    all: () => ["users"] as const,
    detail: (id: string) => ["users", id] as const,
    profile: () => ["users", "profile"] as const,
  },

  // Building related queries
  buildings: {
    all: () => ["buildings"] as const,
    detail: (id: string) => ["buildings", id] as const,
    apartments: (buildingId: string) =>
      ["buildings", buildingId, "apartments"] as const,
  },

  // Apartment related queries
  apartments: {
    all: () => ["apartments"] as const,
    detail: (id: string) => ["apartments", id] as const,
    byOwner: (ownerId: string) => ["apartments", "owner", ownerId] as const,
  },

  // Dashboard related queries
  dashboard: {
    stats: () => ["dashboard", "stats"] as const,
    activity: () => ["dashboard", "activity"] as const,
  },
  subscriptions: {
    all: () => ["subscriptions"] as const,
  },
} as const;
