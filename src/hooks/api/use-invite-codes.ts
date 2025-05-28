import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import type {
  CreateInviteCodeInput,
  UseInviteCodeInput,
  InviteCodeWithDetails,
} from "@/types/invite-codes.types";

// API response types that match the standardized backend format
type InviteCodesResponse = {
  success: boolean;
  message: string;
  data?: InviteCodeWithDetails[];
  error?: string;
};

type InviteCodeResponse = {
  success: boolean;
  message: string;
  data?: InviteCodeWithDetails;
  error?: string;
  code?: string;
};

// Query keys
export const inviteCodeKeys = {
  all: ["invite-codes"] as const,
  byAdministrator: (administratorId: string) =>
    [...inviteCodeKeys.all, "administrator", administratorId] as const,
};

/**
 * Hook to get invite codes for an administrator
 */
export function useInviteCodes(administratorId?: string) {
  return useQuery({
    queryKey: inviteCodeKeys.byAdministrator(administratorId || ""),
    queryFn: async (): Promise<InviteCodeWithDetails[]> => {
      const response = await api.get<InviteCodesResponse>("/invite-codes");
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to fetch invite codes");
      }
      return response.data.data || [];
    },
    enabled: !!administratorId && administratorId !== "placeholder",
  });
}

/**
 * Hook to create a new invite code
 */
export function useCreateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateInviteCodeInput
    ): Promise<InviteCodeWithDetails> => {
      const response = await api.post<InviteCodeResponse>(
        "/invite-codes",
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create invite code");
      }
      return response.data.data!;
    },
    onSuccess: (result, variables, context) => {
      toast.success("Cod de invitație creat cu succes!");
      // Invalidate and refetch invite codes
      queryClient.invalidateQueries({
        queryKey: inviteCodeKeys.all,
      });
    },
    onError: (error: Error) => {
      console.error("Error creating invite code:", error);
      toast.error(error.message || "Eroare la crearea codului de invitație");
    },
  });
}

/**
 * Hook to redeem an invite code
 */
export function useRedeemInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      code: string;
    }): Promise<InviteCodeWithDetails> => {
      const response = await api.post<InviteCodeResponse>(
        "/invite-codes/redeem",
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to redeem invite code");
      }
      return response.data.data!;
    },
    onSuccess: (result, variables) => {
      toast.success("Apartament adăugat cu succes!");
      // Invalidate apartments query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["apartments"],
      });
    },
    onError: (error: Error) => {
      console.error("Error redeeming invite code:", error);
      toast.error(error.message || "Eroare la folosirea codului de invitație");
    },
  });
}

/**
 * Hook to cancel an invite code
 */
export function useCancelInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codeId: string): Promise<InviteCodeWithDetails> => {
      const response = await api.post<InviteCodeResponse>(
        `/invite-codes/${codeId}/cancel`
      );
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to cancel invite code");
      }
      return response.data.data!;
    },
    onSuccess: () => {
      toast.success("Cod de invitație anulat cu succes!");
      // Invalidate and refetch invite codes
      queryClient.invalidateQueries({
        queryKey: inviteCodeKeys.all,
      });
    },
    onError: (error: Error) => {
      console.error("Error cancelling invite code:", error);
      toast.error(error.message || "Eroare la anularea codului de invitație");
    },
  });
}
