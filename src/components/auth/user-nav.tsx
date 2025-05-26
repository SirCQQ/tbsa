"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  LogOut,
  Building2,
  Home,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useSession, useLogout } from "@/hooks/use-auth";
import { useAuthFeedback } from "@/hooks/use-auth-feedback";

interface UserNavProps {
  onLogout?: () => void;
}

export function UserNav({ onLogout }: UserNavProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { data: sessionData, isLoading } = useSession();
  const logoutMutation = useLogout();
  const { showLogoutSuccess, showAuthError, showLoadingFeedback } =
    useAuthFeedback();

  // Early return if no user data
  if (isLoading || !sessionData?.user) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  const user = sessionData.user;

  // Generate user initials for avatar with safe fallbacks
  const getInitials = (
    firstName?: string | null,
    lastName?: string | null
  ): string => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    if (first && last) {
      return `${first}${last}`.toUpperCase();
    }

    if (first) {
      return first.toUpperCase();
    }

    if (last) {
      return last.toUpperCase();
    }

    // Fallback to first letter of email if no names available
    return user.email?.charAt(0)?.toUpperCase() || "U";
  };

  const userInitials = getInitials(user.firstName, user.lastName);

  // Get role display info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "ADMINISTRATOR":
        return {
          label: "Administrator",
          icon: Shield,
          variant: "destructive" as const,
          description: "Acces complet la sistem",
        };
      case "OWNER":
        return {
          label: "Proprietar",
          icon: Home,
          variant: "secondary" as const,
          description: "Gestionare apartamente",
        };
      default:
        return {
          label: role,
          icon: User,
          variant: "outline" as const,
          description: "Utilizator",
        };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  // Safe display name with fallbacks
  const displayName = (() => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.email || "Utilizator";
  })();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const loadingToast = showLoadingFeedback("Se deconectează...");

    try {
      await logoutMutation.mutateAsync();
      showLogoutSuccess();
      onLogout?.();
      router.push("/");
    } catch (error) {
      showAuthError(
        error instanceof Error
          ? error.message
          : "A apărut o eroare neașteptată",
        "Eroare la deconectare"
      );
    } finally {
      loadingToast.dismiss();
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    // Navigate to profile page when implemented
    router.push("/profile");
  };

  const handleDashboardClick = () => {
    // Navigate to dashboard
    router.push("/dashboard");
  };

  const handleSettingsClick = () => {
    // Navigate to settings when implemented
    router.push("/settings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto px-3 py-2 hover:bg-accent"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">
                {displayName}
              </span>
              <div className="flex items-center space-x-1 mt-1">
                <RoleIcon className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-600 text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={roleInfo.variant} className="text-xs">
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleInfo.label}
              </Badge>
              {user.phone && (
                <span className="text-xs text-muted-foreground">
                  {user.phone}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {roleInfo.description}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDashboardClick}>
          <Building2 className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Setări</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Se deconectează..." : "Deconectare"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
