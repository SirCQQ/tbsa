import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InviteCodesService } from "@/services/invite-codes.service";
import type {
  CreateInviteCodeInput,
  UseInviteCodeInput,
} from "@/lib/validations/invite-codes.validations";

// Query keys
export const inviteCodeKeys = {
  all: ["invite-codes"] as const,
  byAdministrator: (administratorId: string) =>
    [...inviteCodeKeys.all, "administrator", administratorId] as const,
};

/**
 * Hook to get invite codes for an administrator
 */
export function useInviteCodes(administratorId: string) {
  return useQuery({
    queryKey: inviteCodeKeys.byAdministrator(administratorId),
    queryFn: () =>
      InviteCodesService.getInviteCodesByAdministrator(administratorId),
    enabled: !!administratorId,
    select: (data) => data.data || [],
  });
}

/**
 * Hook to create a new invite code
 */
export function useCreateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      administratorId,
    }: {
      data: CreateInviteCodeInput;
      administratorId: string;
    }) => InviteCodesService.createInviteCode(data, administratorId),
    onSuccess: (result, { administratorId }) => {
      if (result.success) {
        toast.success("Cod de invitație creat cu succes!");
        // Invalidate and refetch invite codes
        queryClient.invalidateQueries({
          queryKey: inviteCodeKeys.byAdministrator(administratorId),
        });
      } else {
        toast.error(result.error || "Eroare la crearea codului de invitație");
      }
    },
    onError: (error) => {
      console.error("Error creating invite code:", error);
      toast.error("Eroare la crearea codului de invitație");
    },
  });
}

/**
 * Hook to redeem an invite code
 */
export function useRedeemInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UseInviteCodeInput) =>
      InviteCodesService.redeemInviteCode(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Apartament adăugat cu succes!");
        // Invalidate apartments query to refresh the list
        queryClient.invalidateQueries({
          queryKey: ["apartments"],
        });
      } else {
        toast.error(result.error || "Eroare la folosirea codului de invitație");
      }
    },
    onError: (error) => {
      console.error("Error using invite code:", error);
      toast.error("Eroare la folosirea codului de invitație");
    },
  });
}

/**
 * Hook to cancel an invite code
 */
export function useCancelInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      codeId,
      administratorId,
    }: {
      codeId: string;
      administratorId: string;
    }) => InviteCodesService.cancelInviteCode(codeId, administratorId),
    onSuccess: (result, { administratorId }) => {
      if (result.success) {
        toast.success("Cod de invitație anulat cu succes!");
        // Invalidate and refetch invite codes
        queryClient.invalidateQueries({
          queryKey: inviteCodeKeys.byAdministrator(administratorId),
        });
      } else {
        toast.error(result.error || "Eroare la anularea codului de invitație");
      }
    },
    onError: (error) => {
      console.error("Error cancelling invite code:", error);
      toast.error("Eroare la anularea codului de invitație");
    },
  });
}
