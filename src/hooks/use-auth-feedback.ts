"use client";

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { SafeUser } from "@/types/auth";

export function useAuthFeedback() {
  const { toast } = useToast();

  // Success feedback for login
  const showLoginSuccess = useCallback(
    (user: SafeUser) => {
      toast({
        title: "Conectare reușită! 🎉",
        description: `Bun venit, ${user.firstName} ${user.lastName}!`,
        variant: "default",
        duration: 4000,
      });
    },
    [toast]
  );

  // Success feedback for logout
  const showLogoutSuccess = useCallback(() => {
    toast({
      title: "Deconectare reușită",
      description: "Ai fost deconectat cu succes. La revedere!",
      variant: "default",
      duration: 3000,
    });
  }, [toast]);

  // Success feedback for registration
  const showRegistrationSuccess = useCallback(
    (user: SafeUser) => {
      toast({
        title: "Cont creat cu succes! 🎉",
        description: `Bun venit în TBSA, ${user.firstName}!`,
        variant: "default",
        duration: 5000,
      });
    },
    [toast]
  );

  // Error feedback
  const showAuthError = useCallback(
    (error: string, title?: string) => {
      toast({
        title: title || "Eroare de autentificare",
        description: error,
        variant: "destructive",
        duration: 5000,
      });
    },
    [toast]
  );

  // Token refresh feedback (subtle)
  const showTokenRefreshed = useCallback(() => {
    toast({
      title: "Sesiune reîmprospătată",
      description: "Conexiunea ta a fost reîmprospătată automat.",
      variant: "default",
      duration: 2000,
    });
  }, [toast]);

  // Session expired warning
  const showSessionExpired = useCallback(() => {
    toast({
      title: "Sesiune expirată",
      description: "Te rugăm să te conectezi din nou pentru a continua.",
      variant: "destructive",
      duration: 6000,
    });
  }, [toast]);

  // Loading state feedback
  const showLoadingFeedback = useCallback(
    (message: string = "Se încarcă...") => {
      return toast({
        title: message,
        description: "Te rugăm să aștepți...",
        variant: "default",
        duration: Infinity, // Will be dismissed manually
      });
    },
    [toast]
  );

  // Connection status feedback
  const showConnectionStatus = useCallback(
    (isOnline: boolean) => {
      if (isOnline) {
        toast({
          title: "Conexiune restabilită",
          description: "Ești din nou online!",
          variant: "default",
          duration: 3000,
        });
      } else {
        toast({
          title: "Conexiune pierdută",
          description: "Verifică conexiunea la internet.",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
    [toast]
  );

  // Role-specific welcome messages
  const showRoleBasedWelcome = useCallback(
    (user: SafeUser) => {
      const roleMessages = {
        ADMINISTRATOR: {
          title: "Panou Administrator",
          description:
            "Ai acces complet la gestionarea clădirilor și apartamentelor.",
        },
        OWNER: {
          title: "Panou Proprietar",
          description:
            "Poți vizualiza și gestiona citirile pentru apartamentele tale.",
        },
      };

      const message = roleMessages[user.role];
      if (message) {
        toast({
          title: message.title,
          description: message.description,
          variant: "default",
          duration: 4000,
        });
      }
    },
    [toast]
  );

  return {
    showLoginSuccess,
    showLogoutSuccess,
    showRegistrationSuccess,
    showAuthError,
    showTokenRefreshed,
    showSessionExpired,
    showLoadingFeedback,
    showConnectionStatus,
    showRoleBasedWelcome,
  };
}
