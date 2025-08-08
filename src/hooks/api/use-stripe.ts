import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { getStripe } from "@/lib/stripe";
import { ApiResponse } from "@/types/api-response";

type CreateCheckoutRequest = {
  organizationId: string;
  subscriptionPlanId: string;
};

type CheckoutSessionResponse = {
  sessionId: string;
  url: string;
};

/**
 * Hook to create a Stripe checkout session and redirect to Stripe
 */
export function useCreateCheckoutSession(
  options?: UseMutationOptions<
    ApiResponse<CheckoutSessionResponse>,
    Error,
    CreateCheckoutRequest
  >
) {
  return useMutation({
    mutationFn: async (data: CreateCheckoutRequest) => {
      const response = await api.post<ApiResponse<CheckoutSessionResponse>>(
        "/stripe/checkout",
        data
      );
      return response.data;
    },
    onSuccess: async (data, variables, context) => {
      // Redirect to Stripe Checkout
      if (
        data.success &&
        data.data &&
        !Array.isArray(data.data) &&
        data.data.url
      ) {
        window.location.href = data.data.url;
      }

      // Call user-provided onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Checkout session creation failed:", error);

      // Call user-provided onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

/**
 * Hook to handle Stripe checkout with client-side Stripe integration
 * Alternative approach using Stripe.js client-side
 */
export function useStripeCheckout(
  options?: UseMutationOptions<void, Error, CreateCheckoutRequest>
) {
  return useMutation({
    mutationFn: async (data: CreateCheckoutRequest) => {
      // Create checkout session
      const response = await api.post<ApiResponse<CheckoutSessionResponse>>(
        "/stripe/checkout",
        data
      );

      if (
        !response.data.success ||
        !response.data.data ||
        Array.isArray(response.data.data) ||
        !response.data.data.sessionId
      ) {
        throw new Error("Failed to create checkout session");
      }

      // Redirect to Stripe Checkout using Stripe.js
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (error, variables, context) => {
      console.error("Stripe checkout failed:", error);

      // Call user-provided onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

/**
 * Utility hook for handling post-payment URL parameters
 */
export function usePaymentStatus() {
  if (typeof window === "undefined") {
    return { status: null, clearStatus: () => {} };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get("payment");

  const clearStatus = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    window.history.replaceState({}, "", url.toString());
  };

  return {
    status: paymentStatus as "success" | "cancelled" | null,
    clearStatus,
  };
}
