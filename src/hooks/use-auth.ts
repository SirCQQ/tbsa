"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/react-query";
import { getErrorMessage } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: authService.getSession,
    staleTime: 0, // Always consider data stale to force fresh requests
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          return false;
        }
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authService.getProfile,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          return false;
        }
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      toast({
        title: "Autentificare reușită",
        description: data.message || "Bun venit!",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la autentificare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      toast({
        title: "Înregistrare reușită",
        description: data.message || "Contul a fost creat cu succes!",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la înregistrare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      toast({
        title: "Deconectare reușită",
        description: "La revedere!",
      });
    },
    onError: (error) => {
      // Even if logout fails on server, clear local cache
      queryClient.clear();

      toast({
        title: "Eroare la deconectare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: Parameters<typeof authService.updateProfile>[0];
    }) => authService.updateProfile(data),
    onSuccess: () => {
      // Invalidate user queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });

      toast({
        title: "Profil actualizat",
        description: "Informațiile au fost salvate cu succes!",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la actualizare",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (data) => {
      toast({
        title: "Parolă schimbată",
        description: data.message || "Parola a fost schimbată cu succes!",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la schimbarea parolei",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useRequestPasswordReset() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: (data) => {
      toast({
        title: "Email trimis",
        description:
          data.message || "Verifică emailul pentru instrucțiuni de resetare.",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la trimiterea emailului",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (data) => {
      toast({
        title: "Parolă resetată",
        description: data.message || "Parola a fost resetată cu succes!",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la resetarea parolei",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
